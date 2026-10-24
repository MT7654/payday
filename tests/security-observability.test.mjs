import test from 'node:test';
import assert from 'node:assert/strict';
import { requestBoundary } from '../lib/request-boundary.ts';
import { event } from '../lib/telemetry.ts';
import { sameOrigin, limitedBody, HttpError, failure } from '../lib/http.ts';
import { stateHandlers } from '../lib/state-api.ts';
import { aiClient } from '../lib/ai-client.ts';
import { acquireResearch } from '../lib/research-limit.ts';
import { beginPublicResearch } from '../lib/public-research.ts';
import { discoveryHandler } from '../lib/discovery-api.ts';
import { database, request, state } from './helpers.mjs';

test('mutation guard rejects missing/null/foreign origins, cross-site metadata and form posts', () => {
  for (const headers of [{}, { origin: 'null' }, { origin: 'https://evil.test' }, { origin: 'https://payday.test', 'sec-fetch-site': 'cross-site' }, { origin: 'https://payday.test', 'sec-fetch-site': 'same-site' }]) {
    assert.throws(() => sameOrigin(new Request('https://payday.test/api/state', { method: 'DELETE', headers })), error => error.status === 403);
  }
  for (const type of ['text/plain', 'application/x-www-form-urlencoded', 'multipart/form-data']) assert.throws(() => sameOrigin(new Request('https://payday.test/api/discover', { method: 'POST', headers: { origin: 'https://payday.test', 'content-type': type }, body: '{}' })), error => error.status === 415);
  assert.doesNotThrow(() => sameOrigin(request({}, 'POST')));
});

test('blocked state mutations do not authenticate or access storage', async () => {
  let calls = 0;
  const app = stateHandlers({ owner: async () => { calls++; return 'alice'; }, database: () => { throw new Error('not reached'); }, configured: () => false });
  assert.equal((await app.PUT(new Request('https://payday.test/api/state', { method: 'PUT', body: JSON.stringify({ state: state(), revision: 0 }) }))).status, 403);
  assert.equal((await app.DELETE(new Request('https://payday.test/api/state', { method: 'DELETE' }))).status, 403);
  assert.equal(calls, 0);
});

test('stalled request bodies time out and cancel the stream', async () => {
  let cancelled = false;
  const body = new ReadableStream({ cancel() { cancelled = true; } });
  await assert.rejects(limitedBody({ headers: new Headers(), body }, 100, 10), error => error.status === 408);
  assert.equal(cancelled, true);
});

test('request logs correlate failures without exposing identities, paths, query strings or raw exceptions', async () => {
  const logs = [];
  const incoming = new Request('https://payday.test/private/alice@example.com?key=secret', { headers: { 'x-request-id': 'attacker-controlled', authorization: 'Bearer secret' } });
  const response = await requestBoundary(incoming, async () => { throw new Error('private prompt secret'); }, item => logs.push(item));
  assert.equal(response.status, 503);
  const body = await response.json();
  assert.equal(body.requestId, response.headers.get('x-request-id'));
  assert.equal(logs.length, 2);
  assert.ok(logs.every(log => log.requestId === body.requestId && log.route === 'other'));
  assert.equal(logs.at(-1).status, 503);
  assert.ok(!/secret|alice|attacker|private prompt/.test(JSON.stringify({ logs, body })));
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
  assert.ok(response.headers.get('strict-transport-security'));
});

test('concurrent requests keep independent contexts and tolerate logging failures', async () => {
  const logs = [];
  const responses = await Promise.all([1, 2].map(async number => requestBoundary(request({}, 'POST'), async () => {
    await new Promise(resolve => setTimeout(resolve, number === 1 ? 10 : 1));
    event('ai.completed', { inputTokens: number });
    return failure(new HttpError(429, 'Wait', 'research_busy', 5));
  }, log => logs.push(log))));
  assert.notEqual(responses[0].headers.get('x-request-id'), responses[1].headers.get('x-request-id'));
  responses.forEach((response, i) => {
    assert.equal(logs.find(log => log.event === 'ai.completed' && log.requestId === response.headers.get('x-request-id')).inputTokens, i + 1);
    assert.equal(response.headers.get('retry-after'), '5');
    assert.equal(response.headers.get('cache-control'), 'no-store');
  });
  assert.equal((await requestBoundary(request({}), async () => new Response('ok'), () => { throw new Error('logger down'); })).status, 200);
});

test('security wrapper preserves streams and an existing CSP without HSTS on loopback HTTP', async () => {
  const body = new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode('streamed')); c.close(); } });
  const response = await requestBoundary(new Request('http://127.0.0.1/'), async () => new Response(body, { headers: { 'content-security-policy': "default-src 'self'" } }), () => {});
  assert.equal(await response.text(), 'streamed');
  assert.equal(response.headers.get('content-security-policy'), "default-src 'self'");
  assert.equal(response.headers.has('strict-transport-security'), false);
});

test('AI logs report usage and latency but never prompt, key, model output or provider errors', async () => {
  const logs = [];
  const client = aiClient({ OPENAI_API_KEY: 'secret-key' }, async (url, init) => {
    assert.equal(url, 'https://api.openai.com/v1/responses');
    assert.equal(init.redirect, 'error');
    assert.equal(JSON.parse(init.body).store, false);
    return Response.json({ output: [{ type: 'message', content: [{ type: 'output_text', text: 'secret-answer', annotations: [] }] }], usage: { input_tokens: 123, output_tokens: 45 } });
  });
  await requestBoundary(request({}), async () => { await client.response('secret-prompt'); return new Response('ok'); }, item => logs.push(item));
  assert.equal(logs[0].event, 'ai.completed'); assert.equal(logs[0].inputTokens, 123); assert.equal(logs[0].outputTokens, 45);
  const failing = aiClient({ OPENAI_API_KEY: 'secret-key' }, async () => new Response('secret-provider-error', { status: 401 }));
  const response = await requestBoundary(request({}), async () => { await failing.response('secret-prompt'); return new Response('unreachable'); }, item => logs.push(item));
  assert.equal(response.status, 503);
  assert.ok(logs.some(log => log.event === 'ai.failed' && log.code === 'ai_auth'));
  assert.ok(!JSON.stringify(logs).includes('secret'));
  assert.ok(!(await response.text()).includes('secret'));
});

test('AI rejects oversized, malformed, incomplete and empty upstream bodies', async () => {
  for (const response of [new Response('x'.repeat(2_000_001)), new Response('not json'), Response.json(null), Response.json({ output: [null] }), Response.json({ output: [], status: 'incomplete' }), Response.json({ output: [] })]) {
    const client = aiClient({ OPENAI_API_KEY: 'secret-key' }, async () => response);
    await assert.rejects(client.response('prompt'), error => error.status === 502);
  }
});

test('research leases serialize per owner, recover expired workers, and cannot release a newer lease', async () => {
  const db = database();
  const releaseAlice = await acquireResearch(db, 'alice', 1000);
  await assert.rejects(acquireResearch(db, 'alice', 1001), error => error.status === 429);
  const releaseBob = await acquireResearch(db, 'bob', 1001); await releaseBob();
  const releaseNewAlice = await acquireResearch(db, 'alice', 121000);
  await releaseAlice();
  await assert.rejects(acquireResearch(db, 'alice', 121001), error => error.status === 429);
  await releaseNewAlice();
  await (await acquireResearch(db, 'alice', 121002))();
  assert.equal(db.sqlite.prepare('SELECT count(*) AS n FROM research_leases').get().n, 0);
  db.sqlite.close();
});

test('parallel paid research is blocked before quota and provider calls; failure releases the lease', async () => {
  const db = database(); let calls = 0, finish, started;
  const pending = new Promise(resolve => { started = resolve; });
  const handler = discoveryHandler({ begin: request => beginPublicResearch(new Request(request.url, { signal: request.signal, headers: { 'cf-connecting-ip': '192.0.2.1' } }), { database: db, secret: 'test-secret' }), response: async () => { throw new Error('unused'); }, structured: async () => { calls++; started(); await new Promise(resolve => { finish = resolve; }); throw new Error('provider unavailable'); } });
  const body = { action: 'scenarios', mode: 'live', budget: 50, intention: 'Comfort' };
  const first = handler(request(body, 'POST')); await pending;
  const second = await handler(request(body, 'POST'));
  assert.equal(second.status, 429); assert.equal(second.headers.get('retry-after'), '5');
  assert.equal(calls, 1); assert.equal(db.sqlite.prepare('SELECT count FROM request_limits').get().count, 1);
  finish(); assert.equal((await first).status, 503);
  assert.equal(db.sqlite.prepare('SELECT count(*) AS n FROM research_leases').get().n, 0);
  db.sqlite.close();
});
