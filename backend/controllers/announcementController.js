import * as ann from '../models/announcementModel.js';
import { AppError, asyncHandler } from '../utils/AppError.js';

export const list = asyncHandler(async (req, res) => {
  const { category, page, limit } = req.query;
  /* Show announcements relevant to the calling user's role */
  const roleAudienceMap = { student: 'students', faculty: 'faculty', maintenance: 'maintenance' };
  const audience = req.user?.role === 'admin' ? undefined : roleAudienceMap[req.user?.role];
  const result = await ann.findAll({ audience, category, page: Number(page)||1, limit: Math.min(Number(limit)||20,100) });
  res.json({ success: true, message: 'Announcements retrieved', data: result });
});

export const getOne = asyncHandler(async (req, res) => {
  const announcement = await ann.findById(req.params.id);
  if (!announcement) throw new AppError(404, 'Announcement not found', 'NOT_FOUND');
  res.json({ success: true, message: 'Announcement retrieved', data: { announcement } });
});

export const create = asyncHandler(async (req, res) => {
  const announcement = await ann.create({ ...req.body, created_by: req.user.sub });
  res.status(201).json({ success: true, message: 'Announcement created', data: { announcement } });
});

export const update = asyncHandler(async (req, res) => {
  const announcement = await ann.update(req.params.id, req.body);
  if (!announcement) throw new AppError(404, 'Announcement not found', 'NOT_FOUND');
  res.json({ success: true, message: 'Announcement updated', data: { announcement } });
});

export const remove = asyncHandler(async (req, res) => {
  const existing = await ann.findById(req.params.id);
  if (!existing) throw new AppError(404, 'Announcement not found', 'NOT_FOUND');
  await ann.remove(req.params.id);
  res.status(204).send();
});
