/**
 * Zod validation schemas for auth endpoints.
 *
 * Syllabus:
 *   - Input validation & sanitization (Syllabus C & D)
 */

import { z } from 'zod';

export const registerSchema = z.object({
  name:     z.string().min(2).max(100).trim(),
  email:    z.string().email().toLowerCase(),
  password: z.string().min(8).max(72),
  role:     z.enum(['student', 'faculty']).default('student'),
});

export const loginSchema = z.object({
  email:    z.string().email(),
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
