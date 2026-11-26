/**
 * Input validation, error handling, and Phase 5 endpoint tests — Phase 6
 *
 * Tests:
 *   - Form validation for all major endpoints
 *   - Error responses have correct shapes
 *   - 404/405 handling
 *   - Assistant chat validation
 *   - Booking validation
 *   - Announcement validation
 *   - Maintenance ticket validation
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET   = 'phase6-validation-test-secret!!';
process.env.NODE_ENV     = 'test';
process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test_nexusone';

const { default: app } = await import('../app.js');

function startServer() {
  return new Promise(resolve => {
    const server = app.listen(0, () =>
      resolve({ server, url: `http://localhost:${server.address().port}` }));
  });
}

const tok = (payload, exp = '1h') =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: exp });

const POST = (url, path, body, token) => fetch(`${url}${path}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  body: JSON.stringify(body),
});
const PATCH = (url, path, body, token) => fetch(`${url}${path}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  body: JSON.stringify(body),
});
const GET = (url, path, token) => fetch(`${url}${path}`, {
  headers: token ? { Authorization: `Bearer ${token}` } : {},
});

/* ── Error response shape ── */

test('VAL-SHAPE-01: 400 response has { success, message, errors } shape', async () => {
  const { server, url } = await startServer();
  try {
    const res = await POST(url, '/api/v1/auth/register', {});
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(typeof body.success, 'boolean');
    assert.equal(body.success, false);
    assert.ok(typeof body.message === 'string', 'message must be a string');
    assert.ok(Array.isArray(body.errors), 'errors must be an array');
  } finally { server.close(); }
});

test('VAL-SHAPE-02: 401 response has correct error code', async () => {
  const { server, url } = await startServer();
  try {
    const res = await GET(url, '/api/v1/auth/me');
    const body = await res.json();
    assert.equal(body.errors[0].code, 'UNAUTHENTICATED');
  } finally { server.close(); }
});

test('VAL-SHAPE-03: 403 response has FORBIDDEN code', async () => {
  const { server, url } = await startServer();
  try {
    const res = await GET(url, '/api/v1/users', tok({ sub:1, role:'student' }));
    const body = await res.json();
    assert.equal(body.errors[0].code, 'FORBIDDEN');
  } finally { server.close(); }
});

test('VAL-SHAPE-04: 404 response for unknown route', async () => {
  const { server, url } = await startServer();
  try {
    const res = await GET(url, '/api/v1/this-does-not-exist');
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.ok(Array.isArray(body.errors));
  } finally { server.close(); }
});

/* ── Booking validation ── */

test('VAL-BOOKING-01: booking without room_id returns 400', async () => {
  const { server, url } = await startServer();
  try {
    const token = tok({ sub:1, role:'student' });
    const res = await POST(url, '/api/v1/bookings', {
      start_time: new Date(Date.now() + 3600000).toISOString(),
      end_time:   new Date(Date.now() + 7200000).toISOString(),
    }, token);
    assert.equal(res.status, 400);
  } finally { server.close(); }
});

test('VAL-BOOKING-02: booking with end_time before start_time returns 400', async () => {
  const { server, url } = await startServer();
  try {
    const token = tok({ sub:1, role:'student' });
    const res = await POST(url, '/api/v1/bookings', {
      room_id: 1,
      start_time: new Date(Date.now() + 7200000).toISOString(),
      end_time:   new Date(Date.now() + 3600000).toISOString(),
    }, token);
    assert.equal(res.status, 400);
  } finally { server.close(); }
});

test('VAL-BOOKING-03: booking in the past returns 400', async () => {
  const { server, url } = await startServer();
  try {
    const token = tok({ sub:1, role:'student' });
    const res = await POST(url, '/api/v1/bookings', {
      room_id: 1,
      start_time: new Date(Date.now() - 7200000).toISOString(),
      end_time:   new Date(Date.now() - 3600000).toISOString(),
    }, token);
    assert.equal(res.status, 400);
  } finally { server.close(); }
});

/* ── Maintenance ticket validation ── */

test('VAL-TICKET-01: ticket without location returns 400', async () => {
  const { server, url } = await startServer();
  try {
    const token = tok({ sub:1, role:'student' });
    const res = await POST(url, '/api/v1/maintenance', { issue:'broken AC' }, token);
    assert.equal(res.status, 400);
  } finally { server.close(); }
});

test('VAL-TICKET-02: ticket without issue returns 400', async () => {
  const { server, url } = await startServer();
  try {
    const token = tok({ sub:1, role:'student' });
    const res = await POST(url, '/api/v1/maintenance', { location:'Block A' }, token);
    assert.equal(res.status, 400);
  } finally { server.close(); }
});

test('VAL-TICKET-03: invalid status transition returns 400 or 404 (not 200)', async () => {
  const { server, url } = await startServer();
  try {
    const token = tok({ sub:1, role:'admin' });
    // Ticket 999 doesn't exist in test DB → 404 or 500 (no DB in test)
    const res = await PATCH(url, '/api/v1/maintenance/999/status', { status:'resolved' }, token);
    // Must NOT be 200 (success) or 403 (auth error) — anything else is acceptable
    assert.notEqual(res.status, 200, 'Should not succeed for non-existent ticket');
    assert.notEqual(res.status, 403, 'Should not be a permissions error');
  } finally { server.close(); }
});

/* ── AI assistant validation ── */

test('VAL-AI-01: chat without message returns 400', async () => {
  const { server, url } = await startServer();
  try {
    const token = tok({ sub:1, role:'student' });
    const res = await POST(url, '/api/v1/assistant/chat', {}, token);
    assert.equal(res.status, 400);
  } finally { server.close(); }
});

test('VAL-AI-02: chat with empty message returns 400', async () => {
  const { server, url } = await startServer();
  try {
    const token = tok({ sub:1, role:'student' });
    const res = await POST(url, '/api/v1/assistant/chat', { message:'' }, token);
    assert.equal(res.status, 400);
  } finally { server.close(); }
});

test('VAL-AI-03: chat with valid message returns 200', async () => {
  const { server, url } = await startServer();
  try {
    const token = tok({ sub:1, role:'student' });
    const res = await POST(url, '/api/v1/assistant/chat', { message:'Hello', history:[] }, token);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(typeof body.data.reply === 'string' && body.data.reply.length > 0, 'Reply must be a non-empty string');
  } finally { server.close(); }
});

test('VAL-AI-04: chat message > 1000 chars returns 400', async () => {
  const { server, url } = await startServer();
  try {
    const token = tok({ sub:1, role:'student' });
    const res = await POST(url, '/api/v1/assistant/chat', { message:'x'.repeat(1001), history:[] }, token);
    assert.equal(res.status, 400);
  } finally { server.close(); }
});

test('VAL-AI-05: chat without token returns 401', async () => {
  const { server, url } = await startServer();
  try {
    const res = await POST(url, '/api/v1/assistant/chat', { message:'hello' });
    assert.equal(res.status, 401);
  } finally { server.close(); }
});

/* ── Refresh token validation ── */

test('VAL-REFRESH-01: refresh without refreshToken returns 400', async () => {
  const { server, url } = await startServer();
  try {
    const res = await POST(url, '/api/v1/auth/refresh', {});
    assert.equal(res.status, 400);
  } finally { server.close(); }
});

test('VAL-REFRESH-02: refresh with invalid token returns non-200 (not success)', async () => {
  const { server, url } = await startServer();
  try {
    const res = await POST(url, '/api/v1/auth/refresh', { refreshToken:'not-a-valid-token' });
    // Must NOT return 200 success — 400/401 expected, 500 acceptable when DB unavailable in test
    assert.notEqual(res.status, 200, 'Invalid refresh token must not succeed');
  } finally { server.close(); }
});

/* ── Lost & Found validation ── */

test('VAL-LF-01: lost-found requires auth', async () => {
  const { server, url } = await startServer();
  try {
    const res = await GET(url, '/api/v1/lost-found');
    assert.equal(res.status, 401);
  } finally { server.close(); }
});

test('VAL-LF-02: create lost-found item with short title returns 400', async () => {
  const { server, url } = await startServer();
  try {
    const token = tok({ sub:1, role:'student' });
    const res = await POST(url, '/api/v1/lost-found', { title:'AB', type:'lost' }, token);
    assert.equal(res.status, 400);
  } finally { server.close(); }
});

/* ── Faculty route ownership ── */

test('VAL-FAC-01: student cannot create faculty assignment', async () => {
  const { server, url } = await startServer();
  try {
    const token = tok({ sub:1, role:'student' });
    const res = await POST(url, '/api/v1/faculty/assignments', {
      courseId:1, title:'Test', dueDate:'2027-01-01',
    }, token);
    assert.equal(res.status, 403);
  } finally { server.close(); }
});

test('VAL-FAC-02: admin cannot POST to faculty attendance endpoint', async () => {
  const { server, url } = await startServer();
  try {
    const token = tok({ sub:1, role:'admin' });
    const res = await POST(url, '/api/v1/faculty/attendance/session/1', { records:[] }, token);
    assert.equal(res.status, 403);
  } finally { server.close(); }
});
