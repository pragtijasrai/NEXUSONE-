import * as rooms from '../models/roomModel.js';
import { AppError, asyncHandler } from '../utils/AppError.js';
import { z } from 'zod';

const roomSchema = z.object({
  room_code: z.string().min(1).max(20),
  name:      z.string().min(1).max(100),
  building:  z.string().min(1).max(100),
  capacity:  z.number().int().positive(),
  type:      z.enum(['seminar','lab','lecture','study','conference','other']),
  amenities: z.array(z.string()).optional(),
});

export const list = asyncHandler(async (req, res) => {
  const { type, building, search, page, limit, sortBy, sortDir } = req.query;
  const result = await rooms.findAll({ type, building, search, page: Number(page)||1, limit: Math.min(Number(limit)||20,100), sortBy, sortDir });
  res.json({ success: true, message: 'Rooms retrieved', data: result });
});

export const getOne = asyncHandler(async (req, res) => {
  const room = await rooms.findById(req.params.id);
  if (!room) throw new AppError(404, 'Room not found', 'NOT_FOUND');
  res.json({ success: true, message: 'Room retrieved', data: { room } });
});

export const create = asyncHandler(async (req, res) => {
  const data = roomSchema.parse(req.body);
  const room = await rooms.create(data);
  res.status(201).json({ success: true, message: 'Room created', data: { room } });
});

export const update = asyncHandler(async (req, res) => {
  const room = await rooms.update(req.params.id, req.body);
  if (!room) throw new AppError(404, 'Room not found', 'NOT_FOUND');
  res.json({ success: true, message: 'Room updated', data: { room } });
});

export const remove = asyncHandler(async (req, res) => {
  const room = await rooms.findById(req.params.id);
  if (!room) throw new AppError(404, 'Room not found', 'NOT_FOUND');
  await rooms.remove(req.params.id);
  res.status(204).send();
});
