import { AppError, RateLimitError, ValidationError } from '../utils/errors.js';

/**
 * Global error handler
 */
export function errorHandler(err, req, res, next) {
  // Log error
  console.error('Error:', err);
  
  // Handle JSON parse errors
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  
  // Handle custom AppError instances
  if (err instanceof AppError) {
    const response = {
      error: err.message,
    };
    
    if (err.details) {
      response.details = err.details;
    }
    
    if (err instanceof RateLimitError && err.retryAfter) {
      res.setHeader('Retry-After', err.retryAfter);
    }
    
    return res.status(err.statusCode).json(response);
  }
  
  // Handle OpenAI rate limit errors
  if (err.status === 429 || err.response?.status === 429) {
    const retryAfter = err.response?.headers?.['retry-after'] || '60';
    res.setHeader('Retry-After', retryAfter);
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'OpenAI API rate limit reached. Please wait a moment and try again.',
    });
  }
  
  // Handle OpenAI API errors
  if (err.response?.status) {
    return res.status(err.response.status).json({
      error: err.message || 'API error',
      details: err.response.data?.error?.message || 'An error occurred with the AI service',
    });
  }
  
  // Handle validation errors from validators
  if (err.name === 'ValidationError' || err.message?.includes('must be')) {
    return res.status(400).json({
      error: err.message || 'Validation error',
    });
  }
  
  // Default error response
  res.status(err.statusCode || err.status || 500).json({
    error: err.message || 'Internal server error',
  });
}

