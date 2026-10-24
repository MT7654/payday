import test from 'node:test';
import assert from 'node:assert/strict';
import { discoveryHandler } from '../lib/discovery-api.ts';
import { writeState } from '../lib/state-store.ts';
import { evidencedProduct } from '../lib/research-evidence.ts';
import { database, state, request, candidate, research } from './helpers.mjs';

const input = { action: 'products', mode: 'live', budget: 50, intention: 'Comfort', direction: '', interests: '', exclusions: '', reactions: [] };
function setup() {
  const db = database(); let user = 'alice'; const prompts = []; let responseCalls = 0;
  const deps = { owner: async () => { if (!user) throw new Error('AUTH'); return user; }, database: () => db,
    response: async prompt => { prompts.push(prompt); responseCalls++; return research; },
    structured: async prompt => { prompts.push(prompt); return { products: [candidate()], note: '' }; } };
  return { db, deps, prompts, as: value => user = value, get calls() { return responseCalls; }, POST: discoveryHandler(deps) };
}
test('live discovery loads only the current user history and suppresses owned products', async () => {
  const app = setup(); const stored = state();
  stored.saved = [{ ...await evidencedProduct(candidate(), research), savedAt: new Date().toISOString(), decision: 'bought', feedback: 'Love it and use it' }];
  await writeState(app.db, 'alice', stored, 0);
  const response = await app.POST(request(input, 'POST'));
  assert.equal(response.status, 200); assert.deepEqual((await response.json()).products, []);
  assert.ok(app.prompts[0].includes('Love it and use it'));
  app.as('bob'); const bob = await (await app.POST(request(input, 'POST'))).json(); assert.equal(bob.products.length, 1);
  assert.ok(!app.prompts.at(-1).includes('Love it and use it'));
  app.db.sqlite.close();
});
test('server applies negative reactions even when the model ignores them', async () => {
  const app = setup();
  assert.deepEqual((await (await app.POST(request({ ...input, reactions: ['no headphones'] }, 'POST'))).json()).products, []);
  app.db.sqlite.close();
});
test('invalid evidence requests and unauthenticated calls do not consume quota', async () => {
  const app = setup();
  assert.equal((await app.POST(request({ ...input, action: 'evidence' }, 'POST'))).status, 400);
  app.as(null); assert.equal((await app.POST(request(input, 'POST'))).status, 401);
  assert.equal(app.calls, 0); assert.equal(app.db.sqlite.prepare('SELECT count(*) AS n FROM request_limits').get().n, 0);
  app.db.sqlite.close();
});
test('daily cap blocks research and a new day resets the counter', async () => {
  const app = setup(); const today = new Date().toISOString().slice(0, 10);
  app.db.sqlite.prepare('INSERT INTO request_limits VALUES(?,?,?)').run('alice', today, 40);
  assert.equal((await app.POST(request(input, 'POST'))).status, 429); assert.equal(app.calls, 0);
  app.db.sqlite.prepare('UPDATE request_limits SET day=?').run('2000-01-01');
  assert.equal((await app.POST(request(input, 'POST'))).status, 200);
  assert.equal(app.db.sqlite.prepare('SELECT count FROM request_limits').get().count, 1);
  app.db.sqlite.close();
});
test('upstream failures produce retryable errors, not successful recommendations', async () => {
  const app = setup(); app.deps.response = async () => { throw new TypeError('network'); };
  assert.equal((await app.POST(request(input, 'POST'))).status, 503);
  app.db.sqlite.close();
});
test('merchant claims cannot become independent community evidence', async () => {
  const app = setup();
  app.deps.structured = async () => ({ positives: [{ text: 'Everyone loves it', citations: [{ url: research.sources[0].url, quote: 'Acme Headphones.' }] }], concerns: [] });
  const result = await (await app.POST(request({ ...input, action: 'evidence', product: { name: 'Acme Headphones', category: 'Audio' } }, 'POST'))).json();
  assert.deepEqual(result.positives, []); assert.deepEqual(result.sources, []); assert.equal(result.sentiment, 'Unknown');
  app.db.sqlite.close();
});
test('both stages of product research share a single cancellation deadline', async () => {
  const app = setup(); let firstSignal;
  app.deps.response = async (_input, _schema, _search, signal) => { firstSignal = signal; return research; };
  app.deps.structured = async (_input, _schema, signal) => { assert.equal(signal, firstSignal); return { products: [candidate()], note: '' }; };
  assert.equal((await app.POST(request(input, 'POST'))).status, 200);
  app.db.sqlite.close();
});
test('malformed model output is reported as an upstream error', async () => {
  const app = setup(); app.deps.structured = async () => ({ products: 'invalid' });
  assert.equal((await app.POST(request(input, 'POST'))).status, 502);
  app.db.sqlite.close();
});
