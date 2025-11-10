import { config } from '../config/env.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Bearer token required'));
  }
  
  const token = authHeader.substring(7);
  
  if (token !== config.ADMIN_TOKEN) {
    return next(new ForbiddenError('Invalid token'));
  }
  
  next();
}

