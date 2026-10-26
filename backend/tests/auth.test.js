/**
 * Auth API tests — Phase 2
 *
 * Tests run against the Express app with NO real database.
 * Covers: input validation, JWT middleware, RBAC, routing.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET   = 'test-secret-32-chars-long-enough!!';
process.env.NODE_ENV     = 'test';
process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test_nexusone';

const { default: app } = await import('../app.js');

function startServer() {
  return new Promise((resolve) => {
    const server = app.listen(0, () =>
      resolve({ server, url: `http://localhost:${server.address().port}` }),
    );
  });
}

async function post(url, path, body, token) {
  return fetch(`${url}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
}

async function get(url, path, token) {
  return fetch(`${url}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
}

async function patch(url, path, body, token) {
  return fetch(`${url}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
}

function makeToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

function makeExpiredToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: -1 });
}

/* ── Health ── */

test('GET /api/v1/health — always 200', async () => {
  const { server, url } = await startServer();
  try {
    const res = await get(url, '/api/v1/health');
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.success, true);
    assert.ok(['ok', 'degraded'].includes(body.data.status));
  } finally { server.close(); }
});

/* ── Register validation ── */

test('POST /auth/register — missing name returns 400', async () => {
  const { server, url } = await startServer();
  try {
    const res = await post(url, '/api/v1/auth/register', { email: 'a@b.com', password: 'password123' });
    assert.equal(res.status, 400);
  } finally { server.close(); }
});

test('POST /auth/register — invalid email returns 400', async () => {
  const { server, url } = await startServer();
  try {
    const res = await post(url, '/api/v1/auth/register', { name: 'Test', email: 'not-an-email', password: 'password123' });
    assert.equal(res.status, 400);
  } finally { server.close(); }
});

test('POST /auth/register — password too short returns 400', async () => {
  const { server, url } = await startServer();
  try {
    const res = await post(url, '/api/v1/auth/register', { name: 'Test', email: 'a@b.com', password: '123' });
    assert.equal(res.status, 400);
  } finally { server.close(); }
});

test('POST /auth/register — role admin rejected by schema (400)', async () => {
  const { server, url } = await startServer();
  try {
    const res = await post(url, '/api/v1/auth/register', { name: 'X', email: 'x@test.edu', password: 'password123', role: 'admin' });
    assert.equal(res.status, 400);
  } finally { server.close(); }
});

test('POST /auth/register — role maintenance rejected by schema (400)', async () => {
  const { server, url } = await startServer();
  try {
    const res = await post(url, '/api/v1/auth/register', { name: 'X', email: 'x@test.edu', password: 'password123', role: 'maintenance' });
    assert.equal(res.status, 400);
  } finally { server.close(); }
});

test('POST /auth/register — empty body returns 400', async () => {
  const { server, url } = await startServer();
  try {
    const res = await post(url, '/api/v1/auth/register', {});
    assert.equal(res.status, 400);
  } finally { server.close(); }
});

/* ── Login validation ── */

test('POST /auth/login — missing password returns 400', async () => {
  const { server, url } = await startServer();
  try {
    const res = await post(url, '/api/v1/auth/login', { email: 'a@b.com' });
    assert.equal(res.status, 400);
  } finally { server.close(); }
});

test('POST /auth/login — invalid email format returns 400', async () => {
  const { server, url } = await startServer();
  try {
    const res = await post(url, '/api/v1/auth/login', { email: 'not-an-email', password: 'demo1234' });
    assert.equal(res.status, 400);
  } finally { server.close(); }
});

/* ── JWT middleware ── */

test('GET /auth/me — no token returns 401', async () => {
  const { server, url } = await startServer();
  try {
    const res = await get(url, '/api/v1/auth/me');
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.errors[0].code, 'UNAUTHENTICATED');
  } finally { server.close(); }
});

test('GET /auth/me — malformed token returns 401', async () => {
  const { server, url } = await startServer();
  try {
    const res = await get(url, '/api/v1/auth/me', 'this.is.garbage');
    assert.equal(res.status, 401);
  } finally { server.close(); }
});

test('GET /auth/me — expired token returns 401', async () => {
  const { server, url } = await startServer();
  try {
    const expired = makeExpiredToken({ sub: 1, role: 'student' });
    const res = await get(url, '/api/v1/auth/me', expired);
    assert.equal(res.status, 401);
  } finally { server.close(); }
});

test('GET /auth/me — wrong secret returns 401', async () => {
  const { server, url } = await startServer();
  try {
    const forged = jwt.sign({ sub: 1, role: 'admin' }, 'wrong-secret', { expiresIn: '1h' });
    const res = await get(url, '/api/v1/auth/me', forged);
    assert.equal(res.status, 401);
  } finally { server.close(); }
});

test('GET /auth/me — valid token returns user from JWT payload', async () => {
  const { server, url } = await startServer();
  try {
    const token = makeToken({ sub: 99, role: 'student' });
    const res = await get(url, '/api/v1/auth/me', token);
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.data.user.sub, 99);
    assert.equal(body.data.user.role, 'student');
  } finally { server.close(); }
});

/* ── RBAC ── */

test('GET /users — student blocked (403)', async () => {
  const { server, url } = await startServer();
  try {
    const res = await get(url, '/api/v1/users', makeToken({ sub: 1, role: 'student' }));
    assert.equal(res.status, 403);
    assert.equal((await res.json()).errors[0].code, 'FORBIDDEN');
  } finally { server.close(); }
});

test('GET /users — faculty blocked (403)', async () => {
  const { server, url } = await startServer();
  try {
    const res = await get(url, '/api/v1/users', makeToken({ sub: 2, role: 'faculty' }));
    assert.equal(res.status, 403);
  } finally { server.close(); }
});

test('GET /users — maintenance blocked (403)', async () => {
  const { server, url } = await startServer();
  try {
    const res = await get(url, '/api/v1/users', makeToken({ sub: 3, role: 'maintenance' }));
    assert.equal(res.status, 403);
  } finally { server.close(); }
});

test('GET /users — no token returns 401', async () => {
  const { server, url } = await startServer();
  try {
    const res = await get(url, '/api/v1/users');
    assert.equal(res.status, 401);
  } finally { server.close(); }
});

/* ── Profile update validation ── */

test('PATCH /auth/me — role field rejected by strict schema (400)', async () => {
  const { server, url } = await startServer();
  try {
    const res = await patch(url, '/api/v1/auth/me', { role: 'admin' }, makeToken({ sub: 1, role: 'student' }));
    assert.equal(res.status, 400);
  } finally { server.close(); }
});

test('PATCH /auth/me — password field rejected by strict schema (400)', async () => {
  const { server, url } = await startServer();
  try {
    const res = await patch(url, '/api/v1/auth/me', { password: 'newpass' }, makeToken({ sub: 1, role: 'student' }));
    assert.equal(res.status, 400);
  } finally { server.close(); }
});

test('PATCH /auth/me — no token returns 401', async () => {
  const { server, url } = await startServer();
  try {
    const res = await patch(url, '/api/v1/auth/me', { name: 'New Name' });
    assert.equal(res.status, 401);
  } finally { server.close(); }
});

/* ── Change password validation ── */

test('PATCH /auth/me/password — new password too short returns 400', async () => {
  const { server, url } = await startServer();
  try {
    const res = await patch(url, '/api/v1/auth/me/password',
      { currentPassword: 'demo1234', newPassword: '123' }, makeToken({ sub: 1, role: 'student' }));
    assert.equal(res.status, 400);
  } finally { server.close(); }
});

test('PATCH /auth/me/password — missing currentPassword returns 400', async () => {
  const { server, url } = await startServer();
  try {
    const res = await patch(url, '/api/v1/auth/me/password',
      { newPassword: 'newpassword123' }, makeToken({ sub: 1, role: 'student' }));
    assert.equal(res.status, 400);
  } finally { server.close(); }
});

/* ── Refresh validation ── */

test('POST /auth/refresh — missing refreshToken returns 400', async () => {
  const { server, url } = await startServer();
  try {
    const res = await post(url, '/api/v1/auth/refresh', {});
    assert.equal(res.status, 400);
  } finally { server.close(); }
});

/* ── Routing ── */

test('GET /api/v1/nonexistent — returns 404', async () => {
  const { server, url } = await startServer();
  try {
    const res = await get(url, '/api/v1/nonexistent');
    assert.equal(res.status, 404);
  } finally { server.close(); }
});

test('GET /api/v1/rooms — no token returns 401', async () => {
  const { server, url } = await startServer();
  try {
    const res = await get(url, '/api/v1/rooms');
    assert.equal(res.status, 401);
  } finally { server.close(); }
});

test('GET /api/v1/rooms — valid token reaches rooms endpoint (not a 501 stub)', async () => {
  const { server, url } = await startServer();
  try {
    const token = makeToken({ sub: 1, role: 'student' });
    const res = await get(url, '/api/v1/rooms', token);
    /* Rooms is implemented. Without a real test DB it returns 500.
       The important assertion: it is NOT 501 (stub) and NOT 401 (auth rejected). */
    assert.notEqual(res.status, 501, 'rooms must no longer return 501');
    assert.notEqual(res.status, 401, 'valid token must be accepted');
  } finally { server.close(); }
});
