import * as tickets from '../models/ticketModel.js';
import { AppError, asyncHandler } from '../utils/AppError.js';
import { query } from '../config/db.js';

export const list = asyncHandler(async (req, res) => {
  const { status, priority, page, limit } = req.query;
  const role = req.user.role;
  let filter = { status, priority, page: Number(page)||1, limit: Math.min(Number(limit)||20,100) };

  if (role === 'student')     filter.createdBy  = req.user.sub;
  if (role === 'maintenance') {
    /* Find maintenance_staff record for this user */
    const staff = (await query(`SELECT id FROM maintenance_staff WHERE user_id=$1`, [req.user.sub])).rows[0];
    if (staff) filter.assignedTo = staff.id;
  }
  const result = await tickets.findAll(filter);
  res.json({ success: true, message: 'Tickets retrieved', data: result });
});

export const getOne = asyncHandler(async (req, res) => {
  const ticket = await tickets.findById(req.params.id);
  if (!ticket) throw new AppError(404, 'Ticket not found', 'NOT_FOUND');
  /* Students can only see their own */
  if (req.user.role === 'student' && ticket.created_by !== req.user.sub)
    throw new AppError(403, 'Forbidden', 'FORBIDDEN');
  const history = await tickets.getHistory(req.params.id);
  res.json({ success: true, message: 'Ticket retrieved', data: { ticket, history } });
});

export const create = asyncHandler(async (req, res) => {
  const { location, issue, priority } = req.body;
  if (!location || !issue) throw new AppError(400, 'location and issue are required', 'VALIDATION');
  const ticket = await tickets.create({ created_by: req.user.sub, location, issue, priority });
  res.status(201).json({ success: true, message: 'Ticket created', data: { ticket } });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  if (!status) throw new AppError(400, 'status is required', 'VALIDATION');

  const ticket = await tickets.findById(req.params.id);
  if (!ticket) throw new AppError(404, 'Ticket not found', 'NOT_FOUND');
  if (!tickets.isValidTransition(ticket.status, status))
    throw new AppError(400, `Cannot transition from '${ticket.status}' to '${status}'`, 'INVALID_TRANSITION');

  const updated = await tickets.updateStatus(req.params.id, status, req.user.sub, note);
  res.json({ success: true, message: 'Ticket updated', data: { ticket: updated } });
});

export const assign = asyncHandler(async (req, res) => {
  const { staff_id } = req.body;
  if (!staff_id) throw new AppError(400, 'staff_id is required', 'VALIDATION');
  const ticket = await tickets.findById(req.params.id);
  if (!ticket) throw new AppError(404, 'Ticket not found', 'NOT_FOUND');
  const updated = await tickets.assign(req.params.id, staff_id, req.user.sub);
  res.json({ success: true, message: 'Ticket assigned', data: { ticket: updated } });
});
