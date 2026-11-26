import { ZodError } from 'zod';

/**
 * Zod validation middleware.
 * - ZodError → passed to errorHandler as-is (renders as 400 with field details)
 * - Any other exception → re-thrown so errorHandler catches it as a 500
 */
export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (e) {
    if (e instanceof ZodError) return next(e);
    next(e); // non-ZodError: propagate as-is to centralized handler
  }
};
