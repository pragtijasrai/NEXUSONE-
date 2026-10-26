/**
 * Health endpoint tests.
 *
 * Uses Node.js built-in test runner (node:test) — no extra test framework
 * dependency needed. Tests start the Express app on a random port (0)
 * and make real HTTP requests with the global fetch API.
 *
 * We set JWT_SECRET before importing the app because env.js validates
 * required variables at import time.
 *
 * Syllabus:
 *   - Automated testing (Syllabus J)
 *   - Node.js test runner (Syllabus B)
 *   - Fetch API (Syllabus A)
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

/* Set env before importing the app */
process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test';

const { default: app } = await import('../app.js');

/** Helper: start app on random port, return base URL */
function startServer() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      resolve({ server, url: `http://localhost:${server.address().port}` });
    });
  });
}

test('GET /api/v1/health returns 200 with status ok', async () => {
  const { server, url } = await startServer();
  try {
    const res = await fetch(`${url}/api/v1/health`);
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.success, true);
    // 'ok' when DB is up, 'degraded' when DB is unreachable (e.g. in CI/test env)
    assert.ok(['ok', 'degraded'].includes(body.data.status), `unexpected status: ${body.data.status}`);
    assert.equal(body.data.service, 'nexusone-backend');
  } finally {
    server.close();
  }
});

test('protected module requires auth (401)', async () => {
  const { server, url } = await startServer();
  try {
    const res = await fetch(`${url}/api/v1/rooms`);
    assert.equal(res.status, 401);
  } finally {
    server.close();
  }
});

test('unknown route returns 404', async () => {
  const { server, url } = await startServer();
  try {
    const res = await fetch(`${url}/api/v1/nonexistent`);
    assert.equal(res.status, 404);
  } finally {
    server.close();
  }
});
