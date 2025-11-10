import { useState, useEffect, useCallback, useMemo } from 'react';
import { ticketsApi, kbApi } from '../api';
import { formatDate, getUrgencyColor, getIntentColor, renderAnswerWithCitations, handleAuthError } from '../utils';
import { LABELS, PLACEHOLDERS, MESSAGES, INTENT_OPTIONS, URGENCY_OPTIONS, STATUS_OPTIONS, REGENERATE_MODAL, CONFIDENCE_THRESHOLD, STATUS_VALUES } from '../constants';
import Modal from './shared/Modal';
import SelectField from './shared/SelectField';
import ActionButton from './shared/ActionButton';
import InfoField from './shared/InfoField';
import ModerationStatus from './shared/ModerationStatus';
import KBCitations from './shared/KBCitations';

const loadKbArticles = async (citationIds) => {
  if (!citationIds || citationIds.length === 0) return {};

  const articles = {};
  await Promise.all(
    citationIds.map(async (id) => {
      try {
        const kbResponse = await kbApi.get(id);
        articles[id] = kbResponse.data;
      } catch (error) {
        console.error(`Failed to load KB article ${id}:`, error);
      }
    })
  );
  return articles;
};

export default function TicketDetail({ ticketId, onBack }) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedAnswer, setEditedAnswer] = useState('');
  const [editedIntent, setEditedIntent] = useState('');
  const [editedUrgency, setEditedUrgency] = useState('');
  const [editedStatus, setEditedStatus] = useState('');
  const [kbArticles, setKbArticles] = useState({});
  const [showKbArticle, setShowKbArticle] = useState(null);
  const [systemHint, setSystemHint] = useState('');
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);

  const loadTicket = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ticketsApi.get(ticketId);
      const ticketData = response.data;
      setTicket(ticketData);
      setEditedAnswer(ticketData.rag.answerDraft || '');
      setEditedIntent(ticketData.nlp.intent);
      setEditedUrgency(ticketData.nlp.urgency);
      setEditedStatus(ticketData.status);
      if (ticketData.rag.citations && ticketData.rag.citations.length > 0) {
        const articles = await loadKbArticles(ticketData.rag.citations);
        setKbArticles(articles);
      }
    } catch (error) {
      console.error('Failed to load ticket:', error);
      if (!handleAuthError(error)) {
        alert(`${MESSAGES.FAILED_LOAD_TICKET}: ${error.response?.data?.error || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  const handleRegenerate = useCallback(async (hint = null) => {
    try {
      setRegenerating(true);
      const response = await ticketsApi.regenerate(ticketId, hint ? { systemHint: hint } : {});
      const updated = response.data;
      setTicket(updated);
      setEditedAnswer(updated.rag.answerDraft || '');
      setShowRegenerateModal(false);
      setSystemHint('');

      if (updated.rag.citations && updated.rag.citations.length > 0) {
        const articles = await loadKbArticles(updated.rag.citations);
        setKbArticles(articles);
      }
    } catch (error) {
      console.error('Failed to regenerate:', error);
      alert(`${MESSAGES.FAILED_REGENERATE}: ${error.response?.data?.error || error.message}`);
    } finally {
      setRegenerating(false);
    }
  }, [ticketId]);

  const handleSave = useCallback(async () => {
    if (!ticket) return;

    try {
      setSaving(true);
      const updates = {};
      if (editedAnswer !== ticket.rag.answerDraft) updates.answerDraft = editedAnswer;
      if (editedIntent !== ticket.nlp.intent) updates.intent = editedIntent;
      if (editedUrgency !== ticket.nlp.urgency) updates.urgency = editedUrgency;
      if (editedStatus !== ticket.status) updates.status = editedStatus;

      if (Object.keys(updates).length > 0) {
        const response = await ticketsApi.update(ticketId, updates);
        setTicket(response.data);
        alert(MESSAGES.TICKET_UPDATED);
      }
    } catch (error) {
      console.error('Failed to save:', error);
      alert(MESSAGES.FAILED_SAVE_CHANGES);
    } finally {
      setSaving(false);
    }
  }, [ticket, ticketId, editedAnswer, editedIntent, editedUrgency, editedStatus]);

  const handleCitationClick = useCallback((kbId) => {
    setShowKbArticle(kbId);
  }, []);

  const handleStatusUpdate = useCallback(async (status, successMessage) => {
    setEditedStatus(status);
    try {
      setSaving(true);
      const response = await ticketsApi.update(ticketId, { status });
      setTicket(response.data);
      alert(successMessage);
    } catch (error) {
      console.error('Failed to save:', error);
      alert(MESSAGES.FAILED_SAVE_CHANGES);
    } finally {
      setSaving(false);
    }
  }, [ticketId]);

  const handleMarkAsAnswered = useCallback(() => {
    handleStatusUpdate(STATUS_VALUES.ANSWERED, MESSAGES.TICKET_MARKED_ANSWERED);
  }, [handleStatusUpdate]);

  const handleMarkAsNeedsInfo = useCallback(() => {
    handleStatusUpdate(STATUS_VALUES.NEEDS_INFO, MESSAGES.TICKET_MARKED_NEEDS_INFO);
  }, [handleStatusUpdate]);

  const handleCloseRegenerateModal = useCallback(() => {
    setShowRegenerateModal(false);
    setSystemHint('');
  }, []);

  const renderedAnswer = useMemo(() => {
    if (!editedAnswer) return null;
    return renderAnswerWithCitations(editedAnswer, handleCitationClick);
  }, [editedAnswer, handleCitationClick]);

  if (loading) {
    return <div className="text-center py-8">{LABELS.LOADING}</div>;
  }

  if (!ticket) {
    return <div className="text-center py-8">{MESSAGES.TICKET_NOT_FOUND}</div>;
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
      >
        {LABELS.BACK_TO_TICKETS}
      </button>

      <div className="space-y-6">
        <ModerationStatus moderation={ticket.moderation} />

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">{LABELS.ORIGINAL_MESSAGE}</h2>
          <div className="space-y-2">
            <InfoField label={LABELS.EMAIL_LABEL} value={ticket.email} />
            <InfoField label={LABELS.SUBJECT_LABEL} value={ticket.subject} />
            <InfoField label={LABELS.CREATED_LABEL} value={formatDate(ticket.createdAt)} />
            <div className="mt-4">
              <InfoField label={LABELS.MESSAGE_LABEL} value={ticket.message} isMultiline />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">{LABELS.AI_ANALYSIS}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SelectField
              label={LABELS.INTENT}
              value={editedIntent}
              onChange={(e) => setEditedIntent(e.target.value)}
              options={INTENT_OPTIONS}
              getColorClass={getIntentColor}
            />
            <SelectField
              label={LABELS.URGENCY}
              value={editedUrgency}
              onChange={(e) => setEditedUrgency(e.target.value)}
              options={URGENCY_OPTIONS}
              getColorClass={getUrgencyColor}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{LABELS.CONFIDENCE}</label>
              <div className={`px-3 py-2 rounded-md ${ticket.nlp.confidence < CONFIDENCE_THRESHOLD ? 'bg-red-100 text-red-800 font-semibold' : 'bg-gray-100'}`}>
                {(ticket.nlp.confidence * 100).toFixed(0)}%
                {ticket.nlp.confidence < CONFIDENCE_THRESHOLD && ' ⚠️'}
              </div>
            </div>
            <SelectField
              label={LABELS.STATUS}
              value={editedStatus}
              onChange={(e) => setEditedStatus(e.target.value)}
              options={STATUS_OPTIONS}
              className="border-gray-300"
            />
          </div>
          {Object.keys(ticket.nlp.entities).length > 0 && (
            <div className="mt-4">
              <span className="font-medium">{LABELS.ENTITIES}:</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(ticket.nlp.entities).map(([key, value]) => (
                  <span key={key} className="px-2 py-1 bg-gray-100 rounded text-sm">
                    {key}: {value}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{LABELS.DRAFT_ANSWER}</h2>
            <button
              onClick={() => setShowRegenerateModal(true)}
              disabled={regenerating}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {regenerating ? LABELS.REGENERATING : LABELS.REGENERATE}
            </button>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{LABELS.ANSWER_EDITABLE}</label>
            <div className="mb-2 p-3 bg-gray-50 rounded border text-sm text-gray-700 whitespace-pre-wrap">
              {renderedAnswer}
            </div>
            <textarea
              value={editedAnswer}
              onChange={(e) => setEditedAnswer(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder={PLACEHOLDERS.ANSWER_CITATIONS}
            />
          </div>
          <KBCitations
            citations={ticket.rag.citations}
            similarity={ticket.rag.similarity}
            onCitationClick={handleCitationClick}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <ActionButton
            onClick={handleSave}
            label={LABELS.SAVE_CHANGES}
            loadingLabel={LABELS.SAVING}
            isLoading={saving}
            variant="success"
          />
          <ActionButton
            onClick={handleMarkAsAnswered}
            label={LABELS.MARK_AS_ANSWERED}
            variant="primary"
          />
          <ActionButton
            onClick={handleMarkAsNeedsInfo}
            label={LABELS.NEEDS_INFO}
            variant="warning"
          />
        </div>
      </div>

      <Modal
        isOpen={showRegenerateModal}
        onClose={handleCloseRegenerateModal}
        title={REGENERATE_MODAL.TITLE}
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {REGENERATE_MODAL.SYSTEM_HINT_LABEL}
          </label>
          <textarea
            value={systemHint}
            onChange={(e) => setSystemHint(e.target.value)}
            placeholder={PLACEHOLDERS.SYSTEM_HINT}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
          />
          <div className="mt-2 p-3 bg-gray-50 rounded text-xs">
            <p className="font-medium mb-1">{REGENERATE_MODAL.TIPS_TITLE}</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              {REGENERATE_MODAL.TIPS.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={handleCloseRegenerateModal}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            {LABELS.CANCEL}
          </button>
          <ActionButton
            onClick={() => handleRegenerate(systemHint.trim() || null)}
            label={LABELS.REGENERATE}
            loadingLabel={LABELS.REGENERATING}
            isLoading={regenerating}
            variant="primary"
            className="px-4 py-2"
          />
        </div>
      </Modal>

      <Modal
        isOpen={!!showKbArticle && !!kbArticles[showKbArticle]}
        onClose={() => setShowKbArticle(null)}
        title={showKbArticle && kbArticles[showKbArticle]?.title}
        maxHeight="max-h-[80vh]"
      >
        <div className="text-gray-700 whitespace-pre-wrap">
          {showKbArticle && kbArticles[showKbArticle]?.body}
        </div>
      </Modal>
    </div>
  );
}

