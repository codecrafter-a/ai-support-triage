import { ValidationError } from './errors.js';

/**
 * Validation utilities
 */

export function validateRequired(fields, data) {
  const missing = fields.filter(field => !data[field]);
  if (missing.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missing.join(', ')}`,
      { missing }
    );
  }
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }
}

export function validateEnum(value, validValues, fieldName) {
  if (value && !validValues.includes(value)) {
    throw new ValidationError(
      `Invalid ${fieldName}. Must be one of: ${validValues.join(', ')}`,
      { field: fieldName, value, validValues }
    );
  }
}

export function validateStringLength(value, min, max, fieldName) {
  if (value !== undefined && value !== null) {
    if (typeof value !== 'string') {
      throw new ValidationError(`${fieldName} must be a string`);
    }
    if (value.length < min) {
      throw new ValidationError(`${fieldName} must be at least ${min} characters`);
    }
    if (max && value.length > max) {
      throw new ValidationError(`${fieldName} must be at most ${max} characters`);
    }
  }
}

