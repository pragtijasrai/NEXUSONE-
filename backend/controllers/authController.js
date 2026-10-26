/**
 * Auth controller — thin HTTP layer over authService.
 *
 * Every method here does three things only:
 *   1. Extract data from the request (body, headers, user from JWT)
 *   2. Call the service
 *   3. Send the response
 *
 * No business logic. No SQL. Just HTTP plumbing.
 *
 * Syllabus:
 *   - Separation of concerns (Syllabus C)
 *   - JSON request/response (Syllabus A & C)
 *   - Proper HTTP status codes (Syllabus C)
 */

import * as auth from '../services/authService.js';
import { asyncHandler } from '../utils/AppError.js';

export const register = asyncHandler(async (req, res) => {
  const result = await auth.register(req.body);
  res.status(201).json({ success: true, message: 'Account created successfully', data: result });
});

export const login = asyncHandler(async (req, res) => {
  const result = await auth.login(req.body);
  res.json({ success: true, message: 'Login successful', data: result });
});

export const refresh = asyncHandler(async (req, res) => {
  /* The refresh token comes from the request body */
  const { refreshToken } = req.body;
  const result = await auth.refresh(refreshToken);
  res.json({ success: true, message: 'Token refreshed', data: result });
});

export const logout = asyncHandler(async (req, res) => {
  /* Best-effort revocation — we revoke the refresh token if provided */
  const { refreshToken } = req.body;
  await auth.logout(refreshToken);
  res.json({ success: true, message: 'Logged out successfully', data: null });
});

export const me = (req, res) => {
  /* req.user is set by the authenticate middleware from the verified JWT */
  res.json({ success: true, message: 'Authenticated user profile', data: { user: req.user } });
};

export const updateMe = asyncHandler(async (req, res) => {
  const user = await auth.updateProfile(req.user.sub, req.body);
  res.json({ success: true, message: 'Profile updated', data: { user } });
});

export const changePassword = asyncHandler(async (req, res) => {
  await auth.changePassword(req.user.sub, req.body);
  res.json({ success: true, message: 'Password changed successfully', data: null });
});
