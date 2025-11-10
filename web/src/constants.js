/**
 * Application constants - Static text and data
 */

// Intent options
export const INTENT_OPTIONS = [
  { value: 'billing', label: 'Billing' },
  { value: 'technical', label: 'Technical' },
  { value: 'account', label: 'Account' },
  { value: 'other', label: 'Other' },
];

// Urgency options
export const URGENCY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
];

// Status options
export const STATUS_OPTIONS = [
  { value: 'queued', label: 'Queued' },
  { value: 'answered', label: 'Answered' },
  { value: 'needs_info', label: 'Needs Info' },
];

// Intent values
export const INTENT_VALUES = {
  BILLING: 'billing',
  TECHNICAL: 'technical',
  ACCOUNT: 'account',
  OTHER: 'other',
};

// Urgency values
export const URGENCY_VALUES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
};

// Status values
export const STATUS_VALUES = {
  QUEUED: 'queued',
  ANSWERED: 'answered',
  NEEDS_INFO: 'needs_info',
};

// Confidence threshold
export const CONFIDENCE_THRESHOLD = 0.6;

// Labels
export const LABELS = {
  // General
  LOADING: 'Loading...',
  SAVING: 'Saving...',
  SAVE_CHANGES: 'Save Changes',
  CANCEL: 'Cancel',
  DELETE: 'Delete',
  EDIT: 'Edit',
  CREATE: 'Create',
  UPDATE: 'Update',
  SUBMIT: 'Submit',
  SEARCH: 'Search',
  FILTERS: 'Filters',
  BACK: 'Back',
  LOGOUT: 'Logout',
  ADMIN_LOGIN: 'Admin Login',
  
  // Tickets
  TICKETS: 'Tickets',
  CREATE_TICKET: 'Create Ticket',
  CREATING: 'Creating...',
  TICKET_DETAIL: 'Ticket Detail',
  BACK_TO_TICKETS: '← Back to Tickets',
  ORIGINAL_MESSAGE: 'Original Message',
  AI_ANALYSIS: 'AI Analysis',
  DRAFT_ANSWER: 'Draft Answer',
  REGENERATE: 'Regenerate',
  REGENERATING: 'Regenerating...',
  MARK_AS_ANSWERED: 'Mark as Answered',
  NEEDS_INFO: 'Needs Info',
  
  // Knowledge Base
  KNOWLEDGE_BASE: 'Knowledge Base',
  KNOWLEDGE_BASE_MANAGER: 'Knowledge Base Manager',
  NEW_ARTICLE: '+ New Article',
  EDIT_ARTICLE: 'Edit Article',
  CREATE_ARTICLE: 'New Article',
  SEARCH_KB: 'Search KB',
  RE_EMBED_ALL: 'Re-embed All',
  RE_EMBEDDING: 'Re-embedding...',
  SEARCH_KNOWLEDGE_BASE: 'Search knowledge base...',
  SEARCH_RESULTS: 'Search Results:',
  SCORE: 'Score:',
  
  // Form fields
  EMAIL: 'Email',
  EMAIL_ADDRESS: 'Email Address',
  SUBJECT: 'Subject',
  MESSAGE: 'Message',
  TITLE: 'Title',
  BODY: 'Body',
  INTENT: 'Intent',
  URGENCY: 'Urgency',
  STATUS: 'Status',
  CONFIDENCE: 'Confidence',
  ENTITIES: 'Entities',
  CREATED: 'Created',
  UPDATED: 'Updated',
  ACTIONS: 'Actions',
  CITATIONS: 'Citations',
  
  // Field labels for display
  EMAIL_LABEL: 'Email',
  SUBJECT_LABEL: 'Subject',
  CREATED_LABEL: 'Created',
  MESSAGE_LABEL: 'Message',
  ANSWER: 'Answer',
  ANSWER_EDITABLE: 'Answer (editable)',
  
  // Auth
  ADMIN_AUTHENTICATION: 'Admin Authentication',
  ADMIN_TOKEN: 'Admin Token',
  AUTHENTICATE: 'Authenticate',
  BACK_TO_TICKET_SUBMISSION: '← Back to Ticket Submission',
  
  // Ticket Submission
  SUBMIT_SUPPORT_TICKET: 'Submit a Support Ticket',
  SUBMIT_TICKET: 'Submit Ticket',
  SUBMITTING: 'Submitting...',
};

// Placeholders
export const PLACEHOLDERS = {
  SEARCH_SUBJECT_MESSAGE: 'Search subject/message...',
  EMAIL: 'your.email@example.com',
  EMAIL_EXAMPLE: 'user@example.com',
  SUBJECT: 'Brief description of your issue',
  SUBJECT_BRIEF: 'Brief description',
  MESSAGE: 'Describe your issue in detail...',
  MESSAGE_DETAIL: 'Describe the issue...',
  ADMIN_TOKEN: 'Enter admin token',
  ARTICLE_TITLE: 'Enter article title',
  ARTICLE_CONTENT: 'Enter article content',
  ANSWER_CITATIONS: 'Answer will appear here with inline citations like [KB-123]...',
  SYSTEM_HINT: `Examples:
• "Be more technical and detailed"
• "Focus on billing and refund policies"
• "Use simpler language for non-technical users"
• "Emphasize security and privacy aspects"
• "Be more empathetic and supportive"
• "Include step-by-step instructions"

Or leave empty to use default prompt.`,
};

// Messages
export const MESSAGES = {
  // Success
  TICKET_CREATED: (ticketId) => `Ticket created successfully! ID: ${ticketId}`,
  TICKET_UPDATED: 'Ticket updated successfully',
  TICKET_MARKED_ANSWERED: 'Ticket marked as answered',
  TICKET_MARKED_NEEDS_INFO: 'Ticket marked as needs info',
  ARTICLE_SAVED: 'Article saved successfully',
  RE_EMBED_SUCCESS: (count) => `All ${count} articles re-embedded successfully!`,
  RE_EMBED_PARTIAL: (success, failed) => `Re-embedding completed: ${success} succeeded, ${failed} failed. Some articles may need to be re-embedded manually.`,
  
  // Errors
  FAILED_LOAD_TICKETS: 'Failed to load tickets',
  FAILED_LOAD_TICKET: 'Failed to load ticket',
  FAILED_CREATE_TICKET: 'Failed to create ticket',
  FAILED_SAVE_CHANGES: 'Failed to save changes',
  FAILED_REGENERATE: 'Failed to regenerate answer',
  FAILED_LOAD_ARTICLES: 'Failed to load articles',
  FAILED_DELETE_ARTICLE: 'Failed to delete article',
  FAILED_SAVE_ARTICLE: 'Failed to save article',
  FAILED_SEARCH: 'Search failed',
  FAILED_RE_EMBED: 'Failed to re-embed articles',
  TICKET_NOT_FOUND: 'Ticket not found',
  NO_TICKETS_FOUND: 'No tickets found',
  NO_ARTICLES_FOUND: 'No articles found',
  CONTENT_NOT_ALLOWED: 'Content not allowed',
  TICKET_CREATION_FAILED: 'Ticket creation failed',
  UNKNOWN_ERROR: 'Unknown error occurred',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded: The AI service is currently processing many requests. Please wait 30-60 seconds and try again.',
  RATE_LIMIT_EMBEDDING: (retryAfter) => `Rate limit exceeded. Please wait ${retryAfter} seconds before trying again. The OpenAI API has rate limits on embedding requests.`,
  RATE_LIMIT_SEARCH: 'Rate limit exceeded. Please wait a moment and try again.',
  RATE_LIMIT_RE_EMBED: 'Rate limit exceeded. Please wait 5-10 minutes before trying again. The OpenAI API has strict rate limits on embedding requests.',
  
  // Moderation
  MESSAGE_REJECTED: 'Your message was rejected by our content moderation system.',
  
  // Info
  TICKET_PROCESSING_INFO: 'Your ticket will be processed by our AI system. You\'ll receive an immediate response if available.',
  RE_EMBED_CONFIRM: 'Re-embed all articles? This will take a while (about 2 seconds per article) and may hit rate limits. Continue?',
  DELETE_CONFIRM: 'Are you sure you want to delete this article?',
  TOKEN_REQUIRED: 'Token is required',
  DEFAULT_TOKEN_INFO: 'Default token: admin-bearer-token-change-me',
  DEFAULT_TOKEN_VALUE: 'admin-bearer-token-change-me',
  ADMIN_TOKEN_DESCRIPTION: 'Please enter your admin token to access the panel.',
  
  // Ticket Submission
  TICKET_SUBMITTED: 'Ticket Submitted Successfully!',
  TICKET_ID: 'Ticket ID',
  STATUS_LABEL: 'Status:',
  AI_GENERATED_RESPONSE: 'AI-Generated Response:',
  KNOWLEDGE_BASE_SOURCES: 'Knowledge Base Sources:',
  WE_ANALYZE_REQUEST: 'We\'ll analyze your request and provide an AI-generated response',
  DISMISS_TRY_LATER: 'Dismiss and try again later',
  RATE_LIMIT_EXCEEDED_SHORT: 'Rate limit exceeded',
  FAILED_SUBMIT_TICKET: 'Failed to submit ticket',
  FAILED_SUBMIT_TICKET_RETRY: 'Failed to submit ticket. Please try again.',
};

// Table Headers
export const TABLE_HEADERS = {
  TICKETS: {
    CREATED: 'Created',
    EMAIL: 'Email',
    SUBJECT: 'Subject',
    INTENT: 'Intent',
    URGENCY: 'Urgency',
    CONFIDENCE: 'Confidence',
    CITATIONS: 'Citations',
    STATUS: 'Status',
  },
  KB: {
    TITLE: 'Title',
    BODY: 'Body',
    UPDATED: 'Updated',
    ACTIONS: 'Actions',
  },
};

// Regenerate Modal
export const REGENERATE_MODAL = {
  TITLE: 'Regenerate Answer',
  SYSTEM_HINT_LABEL: 'System Prompt Hint (Optional)',
  TIPS_TITLE: '💡 Tips:',
  TIPS: [
    'This overrides the default system prompt for answer generation',
    'Use it to adjust tone, style, or focus of the answer',
    'Keep it concise - the AI will incorporate your instructions',
    'Leave empty to use the default professional support agent style',
  ],
};

// App Titles
export const APP_TITLES = {
  MAIN: 'AI Support Triage - Admin Panel',
  SUBMIT_TICKET: 'Submit a Support Ticket',
};

// Filter Options
export const FILTER_OPTIONS = {
  ALL: 'All',
};

// Knowledge Base Sources
export const KB_SOURCES = {
  LABEL: (count) => `Knowledge Base Sources (${count}):`,
  BEST_MATCH: (similarity) => `Best match similarity: ${(similarity * 100).toFixed(1)}%`,
  CLICK_TO_VIEW: (id) => `Click to view KB article ${id}`,
};

// Moderation
export const MODERATION = {
  CONTENT_APPROVED: 'Content Approved',
  CONTENT_REJECTED: 'Content Rejected',
  REASONS: 'Reasons:',
};

// Form Field Labels
export const FORM_LABELS = {
  EMAIL_ADDRESS: 'Email Address',
  SUBJECT: 'Subject',
  MESSAGE: 'Message',
  TITLE: 'Title',
  BODY: 'Body',
};

// Button States
export const BUTTON_STATES = {
  CREATING: 'Creating...',
  UPDATING: 'Updating...',
  SUBMITTING: 'Submitting...',
  REGENERATING: 'Regenerating...',
  SAVING: 'Saving...',
  RE_EMBEDDING: 'Re-embedding...',
};

// Empty States
export const EMPTY_STATES = {
  NO_TICKETS: 'No tickets found',
  NO_ARTICLES: 'No articles found',
  NO_CITATIONS: '—',
};

// Debounce delay (ms)
export const DEBOUNCE_DELAY = 300;

// API Timeout (ms)
export const API_TIMEOUT = 30000;

