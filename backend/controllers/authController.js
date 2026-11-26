/**
 * Auth controller — thin HTTP layer over authService.
 */

import * as auth from '../services/authService.js';
import { asyncHandler, AppError } from '../utils/AppError.js';
import { persistFile } from '../middleware/upload.js';

export const register = asyncHandler(async (req, res) => {
  const result = await auth.register(req.body);
  res.status(201).json({ success: true, message: 'Account created successfully', data: result });
});

export const login = asyncHandler(async (req, res) => {
  const result = await auth.login(req.body);
  res.json({ success: true, message: 'Login successful', data: result });
});

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await auth.refresh(refreshToken);
  res.json({ success: true, message: 'Token refreshed', data: result });
});

export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  await auth.logout(refreshToken);
  res.json({ success: true, message: 'Logged out successfully', data: null });
});

export const me = (req, res) => {
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

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await auth.forgotPassword(req.body);
  res.json({ success: true, message: 'If this email is registered, a reset link has been sent.', data: result });
});

export const resetPassword = asyncHandler(async (req, res) => {
  await auth.resetPassword(req.body);
  res.json({ success: true, message: 'Password reset successfully. Please log in with your new password.', data: null });
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError(400, 'No file uploaded', 'NO_FILE');
  const dataUri = persistFile(req.file.buffer, req.file.mimetype, 'avatar');
  const user = await auth.updateProfile(req.user.sub, { avatar_url: dataUri });
  res.json({ success: true, message: 'Avatar uploaded', data: { user } });
});
