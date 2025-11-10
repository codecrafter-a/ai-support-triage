import { validateRequired, validateEmail, validateEnum, validateStringLength } from '../utils/validation.js';
import { VALID_INTENTS, VALID_URGENCIES, VALID_STATUSES } from '../config/constants.js';

/**
 * Validate ticket creation input
 */
export function validateCreateTicket(data) {
  validateRequired(['email', 'subject', 'message'], data);
  validateEmail(data.email);
  validateStringLength(data.subject, 1, 500, 'subject');
  validateStringLength(data.message, 1, 10000, 'message');
}

/**
 * Validate ticket update input
 */
export function validateUpdateTicket(data) {
  if (data.status) {
    validateEnum(data.status, VALID_STATUSES, 'status');
  }
  if (data.intent !== undefined) {
    validateEnum(data.intent, VALID_INTENTS, 'intent');
  }
  if (data.urgency !== undefined) {
    validateEnum(data.urgency, VALID_URGENCIES, 'urgency');
  }
  if (data.answerDraft !== undefined) {
    validateStringLength(data.answerDraft, 0, 10000, 'answerDraft');
  }
}

/**
 * Validate ticket filters
 */
export function validateTicketFilters(filters) {
  if (filters.intent) {
    validateEnum(filters.intent, VALID_INTENTS, 'intent');
  }
  if (filters.urgency) {
    validateEnum(filters.urgency, VALID_URGENCIES, 'urgency');
  }
  if (filters.status) {
    validateEnum(filters.status, VALID_STATUSES, 'status');
  }
}

