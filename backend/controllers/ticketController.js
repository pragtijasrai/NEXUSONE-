import * as tickets from '../models/ticketModel.js';
import { AppError, asyncHandler } from '../utils/AppError.js';
import { query } from '../config/db.js';
import { persistFile } from '../middleware/upload.js';

export const uploadAttachment = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError(400, 'No file uploaded', 'NO_FILE');

  const ticket = await tickets.findById(req.params.id);
  if (!ticket) throw new AppError(404, 'Ticket not found', 'NOT_FOUND');

  /* Students can only attach to their own tickets; admin/maintenance can attach to any */
  const isStaff = ['admin', 'maintenance'].includes(req.user.role);
  if (!isStaff && ticket.created_by !== req.user.sub) {
    throw new AppError(403, 'You can only attach files to your own tickets', 'FORBIDDEN');
  }

  const dataUri = persistFile(req.file.buffer, req.file.mimetype, 'attachment');

  const { rows } = await query(
    `UPDATE maintenance_tickets SET attachment_url = $2, updated_at = now()
     WHERE id = $1 RETURNING *`,
    [req.params.id, dataUri],
  );

  /* Notify the ticket owner via notification + socket */
  const { createNotificationAndEmit } = await import('../sockets/notify.js');
  await createNotificationAndEmit({
    userId:    ticket.created_by,
    title:     'Attachment added to your ticket',
    body:      `A file was attached to ticket #${req.params.id}.`,
    type:      'info',
  });

  res.json({ success: true, message: 'Attachment uploaded', data: { ticket: rows[0] } });
});

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

  /* Emit real-time update to ticket owner + notify */
  import('../sockets/notify.js').then(async ({ createNotificationAndEmit, emitTicketUpdate }) => {
    emitTicketUpdate({ userId: ticket.created_by, ticketId: ticket.id, status, note });
    if (ticket.created_by !== req.user.sub) {
      await createNotificationAndEmit({
        userId: ticket.created_by,
        title:  `Ticket #${ticket.id} ${status.replace('_', ' ')}`,
        body:   `Your maintenance request "${ticket.issue.slice(0, 60)}" is now ${status.replace('_', ' ')}.`,
        type:   status === 'resolved' ? 'success' : 'info',
      });
    }
  }).catch(() => { /* non-fatal */ });

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
