import { useState } from 'react';
import { ticketsApi } from '../api';
import { LABELS, PLACEHOLDERS, MESSAGES, APP_TITLES, BUTTON_STATES } from '../constants';

export default function TicketSubmission() {
  const [formData, setFormData] = useState({
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const response = await ticketsApi.create(formData);
      setResult(response.data);
      // Reset form on success
      setFormData({ email: '', subject: '', message: '' });
    } catch (err) {
      if (err.response?.status === 429) {
        // Rate limit error
        setError({
          message: MESSAGES.RATE_LIMIT_EXCEEDED_SHORT,
          details: MESSAGES.RATE_LIMIT_EXCEEDED.split(': ')[1],
          reasons: [],
          isRateLimit: true,
        });
      } else if (err.response?.data) {
        // Handle moderation rejection
        if (err.response.data.allowed === false) {
          setError({
            message: MESSAGES.MESSAGE_REJECTED,
            reasons: err.response.data.reasons || [],
            isRateLimit: false,
          });
        } else {
          setError({
            message: err.response.data.error || err.response.data.message || MESSAGES.FAILED_SUBMIT_TICKET,
            details: err.response.data.details,
            reasons: [],
            isRateLimit: false,
          });
        }
      } else {
        setError({
          message: err.message || MESSAGES.FAILED_SUBMIT_TICKET_RETRY,
          reasons: [],
          isRateLimit: false,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{APP_TITLES.SUBMIT_TICKET}</h1>
            <p className="text-gray-600">{MESSAGES.WE_ANALYZE_REQUEST}</p>
          </div>

          {error && (
            <div className={`mb-6 p-4 border rounded-md ${
              error.isRateLimit 
                ? 'bg-yellow-50 border-yellow-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {error.isRateLimit ? (
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <h3 className={`text-sm font-medium ${
                    error.isRateLimit ? 'text-yellow-800' : 'text-red-800'
                  }`}>
                    {error.message}
                  </h3>
                  {error.details && (
                    <p className={`mt-1 text-sm ${
                      error.isRateLimit ? 'text-yellow-700' : 'text-red-700'
                    }`}>
                      {error.details}
                    </p>
                  )}
                  {error.reasons && error.reasons.length > 0 && (
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc list-inside">
                        {error.reasons.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {error.isRateLimit && (
                    <button
                      onClick={() => {
                        setError(null);
                        setSubmitting(false);
                      }}
                      className="mt-3 text-sm text-yellow-800 underline hover:text-yellow-900"
                    >
                      {MESSAGES.DISMISS_TRY_LATER}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">{MESSAGES.TICKET_SUBMITTED}</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p><strong>{MESSAGES.TICKET_ID}:</strong> {result.ticketId}</p>
                    <p><strong>{MESSAGES.STATUS_LABEL}</strong> {result.status}</p>
                    {result.answerDraft && (
                      <div className="mt-3">
                        <p className="font-medium mb-1">{MESSAGES.AI_GENERATED_RESPONSE}</p>
                        <div className="p-3 bg-white rounded border text-gray-800 whitespace-pre-wrap">
                          {result.answerDraft}
                        </div>
                        {result.citations && result.citations.length > 0 && (
                          <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                            <p className="text-xs font-medium text-blue-800 mb-1">{MESSAGES.KNOWLEDGE_BASE_SOURCES}</p>
                            <div className="flex flex-wrap gap-1">
                              {result.citations.map(id => (
                                <span key={id} className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs font-medium">
                                  KB-{id}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {LABELS.EMAIL_ADDRESS}
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={PLACEHOLDERS.EMAIL}
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                {LABELS.SUBJECT}
              </label>
              <input
                id="subject"
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={PLACEHOLDERS.SUBJECT}
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                {LABELS.MESSAGE}
              </label>
              <textarea
                id="message"
                required
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={PLACEHOLDERS.MESSAGE}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? BUTTON_STATES.SUBMITTING : LABELS.SUBMIT_TICKET}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              {MESSAGES.TICKET_PROCESSING_INFO}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

