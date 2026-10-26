import { query, withTransaction } from '../config/db.js';

/* Valid status transitions — enforced on the server */
const TRANSITIONS = {
  open:        ['assigned', 'in_progress', 'closed'],
  assigned:    ['in_progress', 'closed'],
  in_progress: ['resolved', 'closed'],
  resolved:    ['closed'],
  closed:      [],
};
export const isValidTransition = (from, to) => TRANSITIONS[from]?.includes(to) ?? false;

export const findAll = async ({ status, priority, assignedTo, createdBy, page = 1, limit = 20 } = {}) => {
  const params = [], where = [];
  if (status)     { params.push(status);     where.push(`t.status = $${params.length}`); }
  if (priority)   { params.push(priority);   where.push(`t.priority = $${params.length}`); }
  if (assignedTo) { params.push(assignedTo); where.push(`t.assigned_to = $${params.length}`); }
  if (createdBy)  { params.push(createdBy);  where.push(`t.created_by = $${params.length}`); }
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const total = Number((await query(`SELECT COUNT(*) FROM maintenance_tickets t ${whereClause}`, params)).rows[0].count);
  const offset = (page - 1) * limit;
  params.push(limit, offset);

  const { rows } = await query(
    `SELECT t.*, u.name AS reporter_name,
            ms.id AS staff_id, su.name AS assigned_name
     FROM maintenance_tickets t
     JOIN users u ON u.id = t.created_by
     LEFT JOIN maintenance_staff ms ON ms.id = t.assigned_to
     LEFT JOIN users su ON su.id = ms.user_id
     ${whereClause}
     ORDER BY CASE t.priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
              t.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  return { rows, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const findById = async (id) =>
  (await query(
    `SELECT t.*, u.name AS reporter_name
     FROM maintenance_tickets t JOIN users u ON u.id = t.created_by
     WHERE t.id = $1`, [id],
  )).rows[0];

export const create = async ({ created_by, location, issue, priority }) =>
  (await query(
    `INSERT INTO maintenance_tickets (created_by, location, issue, priority)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [created_by, location, issue, priority ?? 'medium'],
  )).rows[0];

export const updateStatus = async (ticketId, newStatus, changedBy, note = null) =>
  withTransaction(async (client) => {
    const ticket = (await client.query(`SELECT status FROM maintenance_tickets WHERE id = $1`, [ticketId])).rows[0];
    if (!ticket) return null;

    const { rows } = await client.query(
      `UPDATE maintenance_tickets SET
         status = $2, updated_at = now(),
         resolved_at = CASE WHEN $2 = 'resolved' THEN now() ELSE resolved_at END
       WHERE id = $1 RETURNING *`,
      [ticketId, newStatus],
    );
    await client.query(
      `INSERT INTO maintenance_ticket_history (ticket_id, changed_by, old_status, new_status, note)
       VALUES ($1,$2,$3,$4,$5)`,
      [ticketId, changedBy, ticket.status, newStatus, note],
    );
    return rows[0];
  });

export const assign = async (ticketId, staffId, changedBy) =>
  withTransaction(async (client) => {
    const ticket = (await client.query(`SELECT status FROM maintenance_tickets WHERE id = $1`, [ticketId])).rows[0];
    const { rows } = await client.query(
      `UPDATE maintenance_tickets SET assigned_to = $2, status = 'assigned', updated_at = now()
       WHERE id = $1 RETURNING *`,
      [ticketId, staffId],
    );
    await client.query(
      `INSERT INTO maintenance_ticket_history (ticket_id, changed_by, old_status, new_status, note)
       VALUES ($1,$2,$3,'assigned','Assigned to staff')`,
      [ticketId, changedBy, ticket.status],
    );
    return rows[0];
  });

export const getHistory = async (ticketId) =>
  (await query(
    `SELECT h.*, u.name AS changed_by_name FROM maintenance_ticket_history h
     JOIN users u ON u.id = h.changed_by WHERE h.ticket_id = $1 ORDER BY h.created_at ASC`,
    [ticketId],
  )).rows;
