import { test } from 'node:test';
import assert from 'node:assert/strict';
process.env.JWT_SECRET = 'test-secret';
const { default: app } = await import('../app.js');
test('GET /api/health returns ok', async () => {
  const server = app.listen(0);
  const res = await fetch(`http://localhost:${server.address().port}/api/health`);
  const body = await res.json();
  server.close();
  assert.equal(res.status, 200);
  assert.equal(body.status, 'ok');
});
test('protected module requires auth', async () => {
  const server = app.listen(0);
  const res = await fetch(`http://localhost:${server.address().port}/api/rooms`);
  server.close();
  assert.equal(res.status, 401);
});
