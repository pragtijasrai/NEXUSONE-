/**
 * Auth routes.
 *
 * POST /auth/register    — create account (student/faculty only)
 * POST /auth/login       — get access + refresh tokens
 * POST /auth/refresh     — exchange refresh token for new pair
 * POST /auth/logout      — revoke refresh token
 * GET  /auth/me          — current user (requires auth)
 * PATCH /auth/me         — update own profile (requires auth)
 * PATCH /auth/me/password — change own password (requires auth)
 *
 * Syllabus:
 *   - REST API conventions (Syllabus C)
 *   - Authentication middleware (Syllabus D)
 *   - Rate limiting on auth endpoints (Syllabus D & H)
 */

import { Router } from 'express';
import * as c from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { imageUpload } from '../middleware/upload.js';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/authValidator.js';

const r = Router();

/* Public — strict rate limit */
r.post('/register',        authLimiter, validate(registerSchema),       c.register);
r.post('/login',           authLimiter, validate(loginSchema),          c.login);
r.post('/refresh',         authLimiter, validate(refreshSchema),        c.refresh);
r.post('/logout',                                                        c.logout);
r.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), c.forgotPassword);
r.post('/reset-password',  authLimiter, validate(resetPasswordSchema),  c.resetPassword);

/* Protected — require valid access token */
r.get('/me',            authenticate, c.me);
r.patch('/me',          authenticate, validate(updateProfileSchema),  c.updateMe);
r.patch('/me/password', authenticate, validate(changePasswordSchema), c.changePassword);
r.post('/me/avatar',    authenticate, imageUpload.single('avatar'),   c.uploadAvatar);

export default r;
