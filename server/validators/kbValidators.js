import { validateRequired, validateStringLength } from '../utils/validation.js';
import { ValidationError } from '../utils/errors.js';

/**
 * Validate KB article creation/update input
 */
export function validateKBArticle(data) {
  if (data.title !== undefined) {
    validateRequired(['title'], data);
    validateStringLength(data.title, 1, 500, 'title');
  }
  if (data.body !== undefined) {
    validateRequired(['body'], data);
    validateStringLength(data.body, 1, 50000, 'body');
  }
}

/**
 * Validate KB search query
 */
export function validateKBSearch(query) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    throw new ValidationError('Search query is required');
  }
  if (query.length > 1000) {
    throw new ValidationError('Search query must be at most 1000 characters');
  }
}

