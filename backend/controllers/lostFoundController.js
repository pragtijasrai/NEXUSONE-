/**
 * Lost & Found controller — thin HTTP layer over lostFoundModel.
 *
 * Endpoints:
 *   GET    /lost-found           — list items (filter by type, status, category, search)
 *   GET    /lost-found/:id       — get one item
 *   POST   /lost-found            — report a lost or found item
 *   PATCH  /lost-found/:id/status— update item status (owner marks returned, admin manages)
 *   DELETE /lost-found/:id       — delete item (admin only)
 */

import * as lf from '../models/lostFoundModel.js';
import { AppError, asyncHandler } from '../utils/AppError.js';

const VALID_STATUSES = ['open', 'claimed', 'returned', 'expired'];

export const list = asyncHandler(async (req, res) => {
  const { type, status, category, search, page, limit } = req.query;
  const result = await lf.findAll({
    type, status, category, search,
    page: Number(page) || 1,
    limit: Math.min(Number(limit) || 50, 100),
  });
  res.json({ success: true, message: 'Items retrieved', data: result });
});

export const getOne = asyncHandler(async (req, res) => {
  const item = await lf.findById(req.params.id);
  if (!item) throw new AppError(404, 'Item not found', 'NOT_FOUND');
  res.json({ success: true, message: 'Item retrieved', data: { item } });
});

export const create = asyncHandler(async (req, res) => {
  const { title, description, location, category, type } = req.body;
  if (!title || title.trim().length < 3) throw new AppError(400, 'Title must be at least 3 characters', 'VALIDATION');
  if (type && !['lost', 'found'].includes(type)) throw new AppError(400, 'Type must be "lost" or "found"', 'VALIDATION');

  const item = await lf.create({
    reported_by: req.user.sub,
    title: title.trim(),
    description: description?.trim() || null,
    location: location?.trim() || null,
    category: category || 'other',
    type: type || 'lost',
  });
  res.status(201).json({ success: true, message: 'Item reported', data: { item } });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status || !VALID_STATUSES.includes(status)) {
    throw new AppError(400, `Status must be one of: ${VALID_STATUSES.join(', ')}`, 'VALIDATION');
  }

  const item = await lf.findById(req.params.id);
  if (!item) throw new AppError(404, 'Item not found', 'NOT_FOUND');

  /* Only the reporter or an admin can update status */
  if (req.user.role !== 'admin' && item.reported_by !== req.user.sub) {
    throw new AppError(403, 'You can only update your own reports', 'FORBIDDEN');
  }

  const updated = await lf.updateStatus(req.params.id, status);
  res.json({ success: true, message: 'Status updated', data: { item: updated } });
});

export const remove = asyncHandler(async (req, res) => {
  const item = await lf.findById(req.params.id);
  if (!item) throw new AppError(404, 'Item not found', 'NOT_FOUND');
  await lf.remove(req.params.id);
  res.status(204).send();
});
