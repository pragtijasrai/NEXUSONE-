import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
export function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer /, '');
  if (!token) return next(new AppError(401, 'Authentication required', 'UNAUTHENTICATED'));
  try { req.user = jwt.verify(token, env.jwtSecret); next(); } catch { next(new AppError(401, 'Invalid or expired token', 'UNAUTHENTICATED')); }
}
export const requireRole = (...roles) => (req, res, next) => (roles.includes(req.user?.role) ? next() : next(new AppError(403, 'Forbidden', 'FORBIDDEN')));
