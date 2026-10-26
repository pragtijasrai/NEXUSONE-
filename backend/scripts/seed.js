/**
 * Database seed script.
 *
 * Usage:
 *   node scripts/seed.js
 *
 * Creates demo accounts, sample rooms, events, announcements, and tickets
 * so the frontend dashboards have real data to display once the API
 * endpoints are implemented in later phases.
 *
 * All passwords are hashed with bcrypt before insertion — no plaintext
 * passwords in the database.
 *
 * Demo credentials (development only — NOT for production):
 *   student@northbridge.edu     / demo1234
 *   priya.raman@northbridge.edu / demo1234
 *   jordan.ellis@northbridge.edu / demo1234
 *   sam.okafor@northbridge.edu  / demo1234
 *
 * Syllabus: PostgreSQL seed data (Syllabus E)
 */

import bcrypt from 'bcryptjs';
import { pool, query } from '../config/db.js';
import { logger } from '../utils/logger.js';

const PASSWORD_HASH = await bcrypt.hash('demo1234', 12);

async function seed() {
  /* ── Department ── */
  await query(`
    INSERT INTO departments (name, code) VALUES ('Computer Science', 'CS')
    ON CONFLICT (name) DO NOTHING
  `);
  const dept = (await query("SELECT id FROM departments WHERE code = 'CS'")).rows[0];

  /* ── Users (one per role) ── */
  const users = [
    { name: 'Alex Morgan',      email: 'alex.morgan@northbridge.edu',     role: 'student',     dept: dept.id },
    { name: 'Dr. Priya Raman',  email: 'priya.raman@northbridge.edu',     role: 'faculty',     dept: dept.id },
    { name: 'Jordan Ellis',     email: 'jordan.ellis@northbridge.edu',    role: 'admin',       dept: dept.id },
    { name: 'Sam Okafor',       email: 'sam.okafor@northbridge.edu',       role: 'maintenance', dept: dept.id },
  ];

  for (const u of users) {
    await query(
      `INSERT INTO users (name, email, password_hash, role, department_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
      [u.name, u.email, PASSWORD_HASH, u.role, u.dept],
    );
  }

  /* ── Role profiles ── */
  const alex    = (await query("SELECT id FROM users WHERE email = 'alex.morgan@northbridge.edu'")).rows[0];
  const priya   = (await query("SELECT id FROM users WHERE email = 'priya.raman@northbridge.edu'")).rows[0];
  const jordan  = (await query("SELECT id FROM users WHERE email = 'jordan.ellis@northbridge.edu'")).rows[0];
  const sam     = (await query("SELECT id FROM users WHERE email = 'sam.okafor@northbridge.edu'")).rows[0];

  await query(
    `INSERT INTO students (user_id, roll_number, semester, enrollment_year)
     VALUES ($1, 'NB-S-1042', 5, 2024)
     ON CONFLICT (user_id) DO NOTHING`,
    [alex.id],
  );

  await query(
    `INSERT INTO faculty (user_id, employee_id, designation)
     VALUES ($1, 'NB-F-2201', 'Associate Professor')
     ON CONFLICT (user_id) DO NOTHING`,
    [priya.id],
  );

  await query(
    `INSERT INTO maintenance_staff (user_id, employee_id, specialization)
     VALUES ($1, 'NB-M-4110', 'Electrical & HVAC')
     ON CONFLICT (user_id) DO NOTHING`,
    [sam.id],
  );

  /* ── Rooms ── */
  const rooms = [
    { code: 'B-101',  name: 'Seminar Room B-101',  building: 'Block B',    capacity: 30,  type: 'seminar',   amenities: ['Projector','Whiteboard','AC'] },
    { code: 'C-105',  name: 'Computer Lab C-105',  building: 'Block C',    capacity: 40,  type: 'lab',       amenities: ['Computers','Projector','AC'] },
    { code: 'A-301',  name: 'Lecture Hall A-301',  building: 'Block A',    capacity: 120, type: 'lecture',   amenities: ['Mic system','Projector','AC','Recording'] },
    { code: 'D-202',  name: 'Study Room D-202',    building: 'Block D',    capacity: 8,   type: 'study',     amenities: ['Whiteboard','TV Screen'] },
    { code: 'B-205',  name: 'Conference B-205',    building: 'Block B',    capacity: 15,  type: 'conference', amenities: ['Video conf.','Whiteboard','AC'] },
    { code: 'CS-204', name: 'CS Lab CS-204',       building: 'CS Block',   capacity: 35,  type: 'lab',       amenities: ['Computers','Projector','AC','Printer'] },
    { code: 'ENG-301',name: 'Engineering Hall',     building: 'Eng Block',  capacity: 80,  type: 'lecture',   amenities: ['Smart Board','AC','Recording'] },
    { code: 'D-110',  name: 'Discussion Room D-110',building: 'Block D',   capacity: 6,   type: 'study',     amenities: ['Whiteboard'] },
  ];

  for (const r of rooms) {
    await query(
      `INSERT INTO rooms (room_code, name, building, capacity, type, amenities)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (room_code) DO NOTHING`,
      [r.code, r.name, r.building, r.capacity, r.type, r.amenities],
    );
  }

  /* ── Events ── */
  const events = [
    { title: 'Tech Fest 2026',         event_date: '2026-10-28 18:00+05:30', location: 'Innovation Hub',     category: 'technical', organizer: 'CS Dept.',          capacity: 200 },
    { title: 'Cultural Night',         event_date: '2026-11-08 19:00+05:30', location: 'Open Amphitheatre',  category: 'cultural',  organizer: 'Student Union',       capacity: 500 },
    { title: 'Career Fair 2026',       event_date: '2026-11-03 10:00+05:30', location: 'Main Auditorium',   category: 'career',    organizer: 'Placement Cell',     capacity: 800 },
    { title: 'Hackathon — 24hr Sprint', event_date: '2026-11-15 09:00+05:30', location: 'CS Lab Block',      category: 'technical', organizer: 'NexusOne Coding Club',capacity: 100 },
    { title: 'Photography Workshop',   event_date: '2026-11-10 15:00+05:30', location: 'Arts Block',        category: 'hobby',     organizer: 'Photography Club',    capacity: 40 },
    { title: 'Startup Pitch Day',      event_date: '2026-11-20 14:00+05:30', location: 'E-Cell Hall',       category: 'career',    organizer: 'E-Cell',             capacity: 150 },
  ];

  for (const e of events) {
    await query(
      `INSERT INTO events (title, event_date, location, category, organizer, capacity, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT DO NOTHING`,
      [e.title, e.event_date, e.location, e.category, e.organizer, e.capacity, jordan.id],
    );
  }

  /* ── Announcements ── */
  const announcements = [
    { title: 'Library extends hours for midterms', body: 'The main library stays open until midnight from Monday.',     category: 'general',  priority: 'normal', audience: 'all',      created_by: jordan.id },
    { title: 'Database Systems lab moved to CS-110',body: 'This week only. Bring your lab notebook.',                    category: 'academic', priority: 'urgent', audience: 'students', created_by: priya.id },
    { title: 'Hack Night registration is open',     body: 'Teams of up to four. Pizza provided at the Innovation Hub.',  category: 'events',   priority: 'normal', audience: 'all',      created_by: jordan.id },
    { title: 'Campus Shuttle Route C suspended',   body: 'Route C is suspended until Nov 1 due to road maintenance.',   category: 'transport',priority: 'urgent', audience: 'all',      created_by: jordan.id },
  ];

  for (const a of announcements) {
    await query(
      `INSERT INTO announcements (title, body, category, priority, audience, created_by)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT DO NOTHING`,
      [a.title, a.body, a.category, a.priority, a.audience, a.created_by],
    );
  }

  /* ── Maintenance tickets ── */
  const tickets = [
    { location: 'CS-204',     issue: 'Projector not working',    priority: 'high'   },
    { location: 'B-101',      issue: 'AC unit making noise',      priority: 'medium' },
    { location: 'D-202',      issue: 'Light flickering',          priority: 'low'    },
    { location: 'Cafeteria',  issue: 'Water tap leaking',         priority: 'high'   },
    { location: 'Library',    issue: 'WiFi access point down',    priority: 'high'   },
  ];

  for (const t of tickets) {
    await query(
      `INSERT INTO maintenance_tickets (created_by, location, issue, priority)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT DO NOTHING`,
      [alex.id, t.location, t.issue, t.priority],
    );
  }

  logger.info('Seed data inserted successfully.');
  logger.info('Demo login: email = <role>@northbridge.edu, password = demo1234');
  await pool.end();
}

seed().catch((err) => {
  logger.error({ err }, 'Seed failed');
  process.exit(1);
});
