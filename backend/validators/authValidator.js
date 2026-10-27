/**
 * Zod validation schemas for auth endpoints.
 *
 * Syllabus:
 *   - Input validation & sanitization (Syllabus C & D)
 */

import { z } from 'zod';

/* Chitkara University email domain enforced on all auth operations */
const ALLOWED_DOMAIN = 'chitkara.edu.in';

const chitkaraEmail = z.string()
  .email('Enter a valid email address')
  .refine(
    (email) => email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`),
    { message: `Only @${ALLOWED_DOMAIN} email addresses are allowed` },
  );

export const registerSchema = z.object({
  name:     z.string().min(2).max(100).trim(),
  email:    chitkaraEmail.transform((e) => e.toLowerCase()),
  password: z.string().min(8).max(72),
  role:     z.enum(['student', 'faculty']).default('student'),
});

export const loginSchema = z.object({
  email:    chitkaraEmail,
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const updateProfileSchema = z.object({
  name:       z.string().min(2).max(100).trim().optional(),
  phone:      z.string().max(20).trim().optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
}).strict();

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string().min(8).max(72),
});
