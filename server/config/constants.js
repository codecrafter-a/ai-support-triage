/**
 * Application constants
 */

export const TICKET_STATUS = {
  QUEUED: 'queued',
  ANSWERED: 'answered',
  NEEDS_INFO: 'needs_info',
};

export const INTENT_TYPES = {
  BILLING: 'billing',
  TECHNICAL: 'technical',
  ACCOUNT: 'account',
  OTHER: 'other',
};

export const URGENCY_LEVELS = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
};

export const VALID_INTENTS = Object.values(INTENT_TYPES);
export const VALID_URGENCIES = Object.values(URGENCY_LEVELS);
export const VALID_STATUSES = Object.values(TICKET_STATUS);

