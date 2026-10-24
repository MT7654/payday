import test from 'node:test';
import assert from 'node:assert/strict';
import { stateHandlers } from '../lib/state-api.ts';
import { limitedBody } from '../lib/http.ts';
import { database, state, request } from './helpers.mjs';

function setup() {
  const db = database(); let user = 'alice';
  return { db, as: value => user = value, ...stateHandlers({ database: () => db, owner: async () => { if (!user) throw new Error('AUTH'); return user; }, configured: () => false }) };
}
test('state routes isolate users and reject unauthenticated and cross-origin writes', async () => {
  const app = setup();
  assert.equal((await app.PUT(request({ state: state(), revision: 0 }))).status, 200);
  app.as('bob'); assert.equal((await (await app.GET()).json()).state.plans.length, 0);
  app.as(null); assert.equal((await app.GET()).status, 401);
  assert.equal((await app.PUT(request({ state: state(), revision: 0 }))).status, 401);
  app.as('alice');
  assert.equal((await app.PUT(new Request('https://payday.test/api/state', { method: 'PUT', headers: { origin: 'https://other.test' }, body: '{}' }))).status, 403);
  app.db.sqlite.close();
});
test('deletion keeps a revision barrier across empty and recreated states', async () => {
  const app = setup();
  assert.equal((await (await app.PUT(request({ state: state(), revision: 0 }))).json()).revision, 1);
  assert.equal((await (await app.DELETE(request(undefined, 'DELETE'))).json()).revision, 2);
  assert.equal((await app.PUT(request({ state: state(), revision: 1 }))).status, 409);
  assert.equal((await app.PUT(request({ state: state(), revision: 0 }))).status, 409);
  assert.equal((await (await app.GET()).json()).state.plans.length, 0);
  assert.equal((await (await app.PUT(request({ state: state(), revision: 2 }))).json()).revision, 3);
  assert.equal((await app.PUT(request({ state: state(), revision: 1 }))).status, 409);
  assert.equal((await app.PUT(request({ state: state(), revision: 2 }))).status, 409);
  app.as('fresh');
  assert.equal((await app.PUT(request({ state: state(), revision: 8 }))).status, 409);
  await app.DELETE(request(undefined, 'DELETE'));
  assert.equal((await app.PUT(request({ state: state(), revision: 0 }))).status, 409);
  app.db.sqlite.close();
});
test('invalid nested records, impossible dates and invalid timezones cannot poison stored state', async () => {
  const app = setup();
  for (const invalid of [
    { ...state(), sessions: [{}] }, { ...state(), saved: [null] },
    { ...state(), plans: [{ ...state().plans[0], date: '2026-02-31' }] },
    { ...state(), settings: { ...state().settings, timezone: 'not/a-zone' } },
  ]) assert.equal((await app.PUT(request({ state: invalid, revision: 0 }))).status, 400);
  assert.equal((await (await app.GET()).json()).revision, 0);
  app.db.sqlite.close();
});
test('body reader enforces bytes while streaming, not only content-length', async () => {
  let cancelled = false;
  const stream = new ReadableStream({ pull(controller) { controller.enqueue(new TextEncoder().encode('💛'.repeat(100))); }, cancel() { cancelled = true; } });
  await assert.rejects(limitedBody(new Request('https://payday.test', { method: 'POST', body: stream, duplex: 'half' }), 500), error => error.status === 413);
  assert.equal(cancelled, true);
  await assert.rejects(limitedBody(new Request('https://payday.test', { method: 'POST', body: 'not json' })), error => error.status === 400);
});
