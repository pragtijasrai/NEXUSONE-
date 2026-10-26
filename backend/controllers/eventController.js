import * as events from '../models/eventModel.js';
import { AppError, asyncHandler } from '../utils/AppError.js';

export const list = asyncHandler(async (req, res) => {
  const { category, page, limit } = req.query;
  const result = await events.findAll({ category, page: Number(page)||1, limit: Math.min(Number(limit)||20,100) });
  /* Attach registration status for the calling user */
  const userId = req.user?.sub;
  const enriched = await Promise.all(result.rows.map(async (e) => ({
    ...e,
    registered: userId ? await events.isRegistered(e.id, userId) : false,
    seats_filled: Number(e.registrations),
    seats_remaining: e.capacity - Number(e.registrations),
  })));
  res.json({ success: true, message: 'Events retrieved', data: { ...result, rows: enriched } });
});

export const getOne = asyncHandler(async (req, res) => {
  const event = await events.findById(req.params.id);
  if (!event) throw new AppError(404, 'Event not found', 'NOT_FOUND');
  const registered = req.user ? await events.isRegistered(event.id, req.user.sub) : false;
  res.json({ success: true, message: 'Event retrieved', data: { event: { ...event, registered } } });
});

export const create = asyncHandler(async (req, res) => {
  const event = await events.create({ ...req.body, created_by: req.user.sub });
  res.status(201).json({ success: true, message: 'Event created', data: { event } });
});

export const update = asyncHandler(async (req, res) => {
  const event = await events.update(req.params.id, req.body);
  if (!event) throw new AppError(404, 'Event not found', 'NOT_FOUND');
  res.json({ success: true, message: 'Event updated', data: { event } });
});

export const remove = asyncHandler(async (req, res) => {
  const event = await events.findById(req.params.id);
  if (!event) throw new AppError(404, 'Event not found', 'NOT_FOUND');
  await events.remove(req.params.id);
  res.status(204).send();
});

export const register = asyncHandler(async (req, res) => {
  const event = await events.findById(req.params.id);
  if (!event) throw new AppError(404, 'Event not found', 'NOT_FOUND');
  if (Number(event.registrations) >= event.capacity)
    throw new AppError(409, 'Event is fully booked', 'EVENT_FULL');
  const reg = await events.register(req.params.id, req.user.sub);
  if (!reg) throw new AppError(409, 'Already registered for this event', 'ALREADY_REGISTERED');
  res.status(201).json({ success: true, message: 'Registered successfully', data: null });
});

export const unregister = asyncHandler(async (req, res) => {
  await events.unregister(req.params.id, req.user.sub);
  res.json({ success: true, message: 'Registration cancelled', data: null });
});
