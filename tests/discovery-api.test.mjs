import test from 'node:test';
import assert from 'node:assert/strict';
import { discoveryHandler } from '../lib/discovery-api.ts';
import { discoveryState } from '../lib/discovery-state.ts';
import { beginPublicResearch } from '../lib/public-research.ts';
import { writeState } from '../lib/state-store.ts';
import { evidencedProduct } from '../lib/research-evidence.ts';
import { database, state, request, candidate, research } from './helpers.mjs';

const input = { action: 'products', mode: 'live', budget: 50, intention: 'Comfort', direction: '', interests: '', exclusions: '', reactions: [] };
function setup() {
  const db = database(); let user = 'alice'; const prompts = []; let responseCalls = 0;
  const deps = { loadState: discoveryState(async () => user ? { userId: user } : null, () => db), begin: request => beginPublicResearch(new Request(request.url, { signal: request.signal, headers: { 'cf-connecting-ip': '192.0.2.1' } }), { database: db, secret: 'test-secret' }),
    response: async prompt => { prompts.push(prompt); responseCalls++; return research; },
    structured: async (prompt, schema) => { prompts.push(prompt); if (schema.properties.checks) return { checks: [{ id: (await evidencedProduct(candidate(), research)).id, allowed: true, stockQuote: 'Acme Headphones in stock.' }] }; return { products: [candidate()], note: '' }; } };
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
test('invalid requests spend no quota and guests have no saved history', async () => {
  const app = setup();
  assert.equal((await app.POST(request({ ...input, action: 'evidence' }, 'POST'))).status, 400);
  assert.equal(app.calls, 0);
  app.as(null); assert.equal((await app.POST(request(input, 'POST'))).status, 200);
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
  const original = app.deps.structured; app.deps.structured = async (input, schema, signal) => { assert.equal(signal, firstSignal); return original(input, schema); };
  assert.equal((await app.POST(request(input, 'POST'))).status, 200);
  app.db.sqlite.close();
});
test('malformed model output is reported as an upstream error', async () => {
  const app = setup(); app.deps.structured = async () => ({ products: 'invalid' });
  assert.equal((await app.POST(request(input, 'POST'))).status, 502);
  app.db.sqlite.close();
});

test('journey purchases override legacy history and are scoped to the signed-in owner', async () => {
  const app = setup(); const stored = state();
  const product = await evidencedProduct(candidate(), research);
  const { newJournal, newJourney } = await import('../lib/journey.ts');
  // Use the current journal schema, not an unvalidated test-only history shape.
  const journal = newJournal();
  stored.saved = [{ ...product, savedAt: new Date().toISOString(), decision: 'saved' }];
  journal.finds = [{ ...product, savedAt: new Date().toISOString(), decision: 'bought', brief: newJourney().brief, feedback: 'Returned it' }];
  stored.journey = journal;
  await writeState(app.db, 'alice', stored, 0);
  assert.deepEqual((await (await app.POST(request(input, 'POST'))).json()).products, []);
  app.as('bob'); assert.equal((await (await app.POST(request(input, 'POST'))).json()).products.length, 1);
  app.as(null); assert.equal((await (await app.POST(request({ ...input, owner: 'alice' }, 'POST'))).json()).products.length, 1);
  app.db.sqlite.close();
});

test('recheck rejects substituted listings, fabricated prices and unsupported stock', async () => {
  for (const kind of ['valid', 'substitution', 'price', 'stock', 'party']) {
    const app = setup();
    app.deps.structured = async (_prompt, schema) => {
      if (schema.properties.products) {
        const value = candidate(); if (kind === 'price') value.pricing.item = 1;
        return { products: [value], note: '' };
      }
      return { url: candidate().url, quote: kind === 'stock' ? 'Acme Headphones available to book.' : 'Acme Headphones in stock.', allowed: true };
    };
    const result = await (await app.POST(request({ ...input, action: 'recheck', people: kind === 'party' ? 2 : 1, product: { name: 'Acme Headphones', category: 'Audio', url: kind === 'substitution' ? 'https://shop.test/other' : candidate().url } }, 'POST'))).json();
    assert.equal(result.available, kind === 'valid', kind);
    if (kind === 'valid') { assert.equal(result.price, 45); assert.equal(result.totalCostKnown, true); }
    if (kind === 'price' || kind === 'substitution') assert.equal(result.price, 0);
    app.db.sqlite.close();
  }
});

test('shortlist rejects per-person pricing for a party and cannot invent stock', async () => {
  const app = setup();
  assert.deepEqual((await (await app.POST(request({ ...input, people: 2 }, 'POST'))).json()).products, []);
  app.deps.response = async () => ({ ...research, passages: research.passages.map(p => ({ ...p, text: p.text.replace('Acme Headphones in stock.', '') })) });
  assert.deepEqual((await (await app.POST(request(input, 'POST'))).json()).products, []);
  app.db.sqlite.close();
});

test('shortlist and recheck require the quoted price to cover explicit participants', async () => {
  for (const [suffix, accepted] of [
    [', warranty for 2 years.', false],
    [' for 2 hours.', false],
    [' for 2 participants.', true],
    [' total for a group of 2 adults.', true],
    [' per person for 2 participants.', false],
    [' for 3 participants.', false],
  ]) {
    for (const action of ['products', 'recheck']) {
      const app = setup(); const value = candidate();
      value.pricing.evidence.find(f => f.field === 'item').quote = `Acme Headphones item S$40${suffix}`;
      const text = value.pricing.evidence.map(f => f.quote).join(' ') + ' Acme Headphones in stock.';
      app.deps.response = async () => ({ text, sources: research.sources, passages: [{ url: value.url, text }] });
      app.deps.structured = async (_prompt, schema) => {
        if (schema.properties.products) return { products: [value], note: '' };
        if (schema.properties.checks) return { checks: [{ id: (await evidencedProduct(candidate(), research)).id, allowed: true, stockQuote: 'Acme Headphones in stock.' }] };
        return { url: value.url, quote: 'Acme Headphones in stock.', allowed: true };
      };
      const response = await app.POST(request({ ...input, action, people: 2, product: { name: value.name, category: value.category, url: value.url } }, 'POST'));
      assert.equal(response.status, 200);
      const result = await response.json();
      assert.equal(action === 'products' ? result.products.length === 1 : result.available, accepted, `${action}: ${suffix}`);
      app.db.sqlite.close();
    }
  }
});
