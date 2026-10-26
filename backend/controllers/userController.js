/**
 * User controller — admin user management endpoints.
 *
 * Syllabus:
 *   - CRUD endpoints (Syllabus C)
 *   - Role-based access control (Syllabus D)
 *   - Pagination (Syllabus C & G)
 */

import * as userService from '../services/userService.js';
import { asyncHandler } from '../utils/AppError.js';

export const list = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, status, search, sortBy, sortDir } = req.query;
  const result = await userService.list({
    page: Number(page),
    limit: Math.min(Number(limit), 100), // cap at 100
    role, status, search, sortBy, sortDir,
  });
  res.json({ success: true, message: 'Users retrieved', data: result });
});

export const getOne = asyncHandler(async (req, res) => {
  const user = await userService.getById(req.params.id);
  res.json({ success: true, message: 'User retrieved', data: { user } });
});

export const update = asyncHandler(async (req, res) => {
  const user = await userService.adminUpdate(req.params.id, req.body);
  res.json({ success: true, message: 'User updated', data: { user } });
});

export const remove = asyncHandler(async (req, res) => {
  await userService.remove(req.params.id, req.user.sub);
  res.status(204).send();
});
