import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { ticketsApi } from '../api';
import { formatDate, getUrgencyColor, getIntentColor, getStatusColor, handleAuthError, debounce } from '../utils';
import { LABELS, PLACEHOLDERS, MESSAGES, INTENT_OPTIONS, URGENCY_OPTIONS, STATUS_OPTIONS, TABLE_HEADERS, FILTER_OPTIONS, BUTTON_STATES, EMPTY_STATES, DEBOUNCE_DELAY, FORM_LABELS } from '../constants';
import ActionButton from './shared/ActionButton';
import InputField from './shared/InputField';
import SelectField from './shared/SelectField';
import Modal from './shared/Modal';
import Badge from './shared/Badge';
import ConfidenceDisplay from './shared/ConfidenceDisplay';
import CitationsBadge from './shared/CitationsBadge';
import TableHeader from './shared/TableHeader';

export default function TicketsList({ onSelectTicket }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    q: '',
    intent: '',
    urgency: '',
    status: '',
  });

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ticketsApi.list(filters);
      setTickets(response.data);
    } catch (error) {
      console.error('Failed to load tickets:', error);
      if (!handleAuthError(error)) {
        alert(`${MESSAGES.FAILED_LOAD_TICKETS}: ${error.response?.data?.error || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const debouncedLoadTickets = useMemo(
    () => debounce(loadTickets, DEBOUNCE_DELAY),
    [loadTickets]
  );

  useEffect(() => {
    if (filters.q) {
      debouncedLoadTickets();
    } else {
      loadTickets();
    }
  }, [filters.q, filters.intent, filters.urgency, filters.status, loadTickets, debouncedLoadTickets]);

  const handleCreateTicket = useCallback(async (formData) => {
    try {
      const response = await ticketsApi.create(formData);
      alert(MESSAGES.TICKET_CREATED(response.data.ticketId));
      setShowCreateModal(false);
      loadTickets();
    } catch (error) {
      if (error.response?.status === 429) {
        alert(MESSAGES.RATE_LIMIT_EXCEEDED);
      } else if (error.response?.data?.allowed === false) {
        alert(`${MESSAGES.TICKET_CREATION_FAILED}: ${error.response.data.reasons?.join(', ') || MESSAGES.CONTENT_NOT_ALLOWED}`);
      } else {
        const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message;
        const details = error.response?.data?.details;
        alert(`${MESSAGES.FAILED_CREATE_TICKET}: ${errorMsg}${details ? `\n\n${details}` : ''}`);
      }
    }
  }, [loadTickets]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">{LABELS.TICKETS}</h2>
        <ActionButton
          onClick={() => setShowCreateModal(true)}
          label={LABELS.CREATE_TICKET}
          variant="primary"
          className="px-4 py-2"
        />
      </div>

      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">{LABELS.FILTERS}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <InputField
            id="filter-search"
            label={LABELS.SEARCH}
            type="text"
            value={filters.q}
            onChange={(e) => handleFilterChange('q', e.target.value)}
            placeholder={PLACEHOLDERS.SEARCH_SUBJECT_MESSAGE}
            className="mb-0"
          />
          <SelectField
            label={LABELS.INTENT}
            value={filters.intent}
            onChange={(e) => handleFilterChange('intent', e.target.value)}
            options={[{ value: '', label: FILTER_OPTIONS.ALL }, ...INTENT_OPTIONS]}
            className="mb-0"
          />
          <SelectField
            label={LABELS.URGENCY}
            value={filters.urgency}
            onChange={(e) => handleFilterChange('urgency', e.target.value)}
            options={[{ value: '', label: FILTER_OPTIONS.ALL }, ...URGENCY_OPTIONS]}
            className="mb-0"
          />
          <SelectField
            label={LABELS.STATUS}
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            options={[{ value: '', label: FILTER_OPTIONS.ALL }, ...STATUS_OPTIONS]}
            className="mb-0"
          />
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <TableHead />
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <TableEmptyState colSpan={8} message={LABELS.LOADING} />
            ) : tickets.length === 0 ? (
              <TableEmptyState colSpan={8} message={EMPTY_STATES.NO_TICKETS} isError />
            ) : (
              tickets.map((ticket) => (
                <TicketRow
                  key={ticket.id}
                  ticket={ticket}
                  onSelect={onSelectTicket}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <CreateTicketModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTicket}
      />
    </div>
  );
}

const TableHead = memo(function TableHead() {
  return (
    <thead className="bg-gray-50">
      <tr>
        <TableHeader>{TABLE_HEADERS.TICKETS.CREATED}</TableHeader>
        <TableHeader>{TABLE_HEADERS.TICKETS.EMAIL}</TableHeader>
        <TableHeader>{TABLE_HEADERS.TICKETS.SUBJECT}</TableHeader>
        <TableHeader>{TABLE_HEADERS.TICKETS.INTENT}</TableHeader>
        <TableHeader>{TABLE_HEADERS.TICKETS.URGENCY}</TableHeader>
        <TableHeader>{TABLE_HEADERS.TICKETS.CONFIDENCE}</TableHeader>
        <TableHeader>{TABLE_HEADERS.TICKETS.CITATIONS}</TableHeader>
        <TableHeader>{TABLE_HEADERS.TICKETS.STATUS}</TableHeader>
      </tr>
    </thead>
  );
});

const TableEmptyState = memo(function TableEmptyState({ colSpan, message, isError = false }) {
  return (
    <tr>
      <td colSpan={colSpan} className={`px-6 py-4 text-center ${isError ? 'text-gray-500' : ''}`}>
        {message}
      </td>
    </tr>
  );
});

const TicketRow = memo(function TicketRow({ ticket, onSelect }) {
  const handleClick = useCallback(() => {
    onSelect(ticket.id);
  }, [ticket.id, onSelect]);

  return (
    <tr
      onClick={handleClick}
      className="hover:bg-gray-50 cursor-pointer"
    >
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(ticket.createdAt)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.email}</td>
      <td className="px-6 py-4 text-sm text-gray-900">{ticket.subject}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge label={ticket.nlp.intent} getColorClass={getIntentColor} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge label={ticket.nlp.urgency} getColorClass={getUrgencyColor} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <ConfidenceDisplay confidence={ticket.nlp.confidence} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <CitationsBadge citations={ticket.rag?.citations} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge label={ticket.status} getColorClass={getStatusColor} />
      </td>
    </tr>
  );
});

function CreateTicketModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(formData);
      setFormData({ email: '', subject: '', message: '' });
    } catch (error) {
      if (error.response?.status === 429) {
        setError(MESSAGES.RATE_LIMIT_EXCEEDED);
      }
    } finally {
      setSubmitting(false);
    }
  }, [formData, onSubmit]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ email: '', subject: '', message: '' });
      setError(null);
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={LABELS.CREATE_TICKET}
    >
      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          id="create-email"
          label={FORM_LABELS.EMAIL_ADDRESS}
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          placeholder={PLACEHOLDERS.EMAIL_EXAMPLE}
          className="mb-0"
        />

        <InputField
          id="create-subject"
          label={FORM_LABELS.SUBJECT}
          type="text"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          required
          placeholder={PLACEHOLDERS.SUBJECT_BRIEF}
          className="mb-0"
        />

        <InputField
          id="create-message"
          label={FORM_LABELS.MESSAGE}
          type="textarea"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          required
          rows={6}
          placeholder={PLACEHOLDERS.MESSAGE_DETAIL}
          className="mb-0"
        />

        <div className="flex justify-end gap-2 pt-4">
          <ActionButton
            type="button"
            onClick={onClose}
            label={LABELS.CANCEL}
            variant="primary"
            className="px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300"
          />
          <ActionButton
            type="submit"
            label={LABELS.CREATE_TICKET}
            loadingLabel={BUTTON_STATES.CREATING}
            isLoading={submitting}
            disabled={submitting}
            variant="primary"
            className="px-4 py-2"
          />
        </div>
      </form>
    </Modal>
  );
}

