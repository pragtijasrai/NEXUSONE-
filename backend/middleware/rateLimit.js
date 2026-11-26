/**
 * Rate limiting middleware.
 *
 * Two tiers:
 *   1. authLimiter — strict, applies to login/register/password-reset
 *   2. apiLimiter  — general, applies to all other API routes
 *
 * Production values are more conservative than development.
 * Tests run with high limits (1000) so they don't hit rate limit errors.
 */

import rateLimit from 'express-rate-limit';
import { isProd, isTest } from '../config/env.js';

const isTestOrDev = isTest || !isProd;

/* Auth endpoints: 5 requests per 15 min in production, 1000 in test/dev */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTestOrDev ? 1000 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts. Please try again in 15 minutes.',
    errors: [{ code: 'RATE_LIMITED', message: 'Rate limit exceeded' }],
  },
});

/* General API: 100 requests per 15 min in production, unlimited in test/dev */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTestOrDev ? 10000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
    errors: [{ code: 'RATE_LIMITED', message: 'Rate limit exceeded' }],
  },
});
