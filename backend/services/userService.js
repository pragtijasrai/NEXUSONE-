/**
 * User service — admin user management business logic.
 *
 * Syllabus:
 *   - Role-based authorization (Syllabus D)
 *   - Separation of concerns (Syllabus C)
 */

import { AppError } from '../utils/AppError.js';
import * as users from '../models/userModel.js';
import * as tokenModel from '../models/tokenModel.js';

const VALID_ROLES    = ['student', 'faculty', 'admin', 'maintenance'];
const VALID_STATUSES = ['active', 'inactive', 'suspended'];

const publicUser = ({ id, name, email, role, status, created_at }) =>
  ({ id, name, email, role, status, created_at });

export async function list(query) {
  const { rows, total, page, limit, totalPages } = await users.findAll(query);
  return { users: rows, meta: { total, page, limit, totalPages } };
}

export async function getById(id) {
  const user = await users.findById(id);
  if (!user) throw new AppError(404, 'User not found', 'NOT_FOUND');
  return publicUser(user);
}

export async function adminUpdate(id, { status, role }) {
  let user = await users.findById(id);
  if (!user) throw new AppError(404, 'User not found', 'NOT_FOUND');

  if (status !== undefined) {
    if (!VALID_STATUSES.includes(status)) throw new AppError(400, `Invalid status: ${status}`, 'VALIDATION');
    user = await users.updateStatus(id, status);
  }

  if (role !== undefined) {
    if (!VALID_ROLES.includes(role)) throw new AppError(400, `Invalid role: ${role}`, 'VALIDATION');
    user = await users.updateRole(id, role);
  }

  return publicUser(user);
}

export async function remove(id, actorId) {
  if (String(id) === String(actorId)) {
    throw new AppError(400, 'You cannot delete your own account', 'SELF_DELETE');
  }
  const user = await users.findById(id);
  if (!user) throw new AppError(404, 'User not found', 'NOT_FOUND');
  await tokenModel.revokeAll(id);
  await users.remove(id);
}
