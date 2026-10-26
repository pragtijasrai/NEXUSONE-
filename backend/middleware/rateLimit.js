/**
 * Rate limiting middleware.
 *
 * Two tiers:
 *   1. authLimiter — strict, applies to login/register/password-reset
 *   2. apiLimiter  — general, applies to all other API routes
 *
 * Rate limiting prevents brute-force password guessing and API abuse.
 * The window and max values are conservative for a university project.
 *
 * Syllabus: Security — rate limiting (Syllabus D & H)
 */

import rateLimit from 'express-rate-limit';

/* Strict limiter for auth endpoints: 5 requests per 15 minutes per IP */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 1000 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts. Please try again in 15 minutes.',
    errors: [{ code: 'RATE_LIMITED', message: 'Rate limit exceeded' }],
  },
});

/* General API limiter: 100 requests per 15 minutes per IP */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
    errors: [{ code: 'RATE_LIMITED', message: 'Rate limit exceeded' }],
  },
});
