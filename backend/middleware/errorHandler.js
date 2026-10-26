/**
 * Centralized error-handling middleware.
 *
 * Express error-handling middleware has the signature (err, req, res, next).
 * It must be registered LAST — after all routes — with app.use(errorHandler).
 *
 * Error flow:
 *   1. A route or service throws an AppError (e.g. AppError(409, 'Email taken'))
 *   2. asyncHandler catches it and calls next(err)
 *   3. This middleware receives the error and sends a JSON response
 *   4. In production, 500 errors get a generic message (no stack trace leakage)
 *
 * ZodError is handled specially: it's a validation failure (400) with
 * per-field error details so the frontend can show field-level messages.
 *
 * Syllabus:
 *   - Centralized error handling (Syllabus C & I)
 *   - Proper HTTP status codes (Syllabus C)
 *   - No stack trace leakage in production (Syllabus D — Security)
 */

import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';

/** 404 handler — no route matched the request */
export function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `No route for ${req.method} ${req.path}`,
    errors: [{ code: 'NOT_FOUND' }],
  });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  /* ── Zod validation errors → 400 ── */
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Invalid request data',
      errors: err.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      })),
    });
  }

  const status = err.status || 500;

  /* ── Log unexpected errors (500s) ── */
  if (status >= 500) {
    logger.error({ err, path: req.path, method: req.method }, 'Unhandled error');
  }

  /* ── In production, never leak internal details for 500s ── */
  const message = status >= 500 && process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  return res.status(status).json({
    success: false,
    message,
    errors: [{ code: err.code || 'ERROR' }],
  });
}
