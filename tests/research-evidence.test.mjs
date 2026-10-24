import test from 'node:test';
import assert from 'node:assert/strict';
import { evidencedProduct, discussionURL, extractResearch } from '../lib/research-evidence.ts';
import { stableProductId, preferences, rejectedByHistory, upsertSaved } from '../lib/preferences.ts';
import { sampleMatches } from '../lib/catalogue.ts';
import { constrainProducts } from '../lib/rewards.ts';
import { candidate, research } from './helpers.mjs';

test('negative feedback excludes products in demo and final live filtering', () => {
  for (const reaction of ['no headphones', 'I already have headphones', "I don't want headphones", 'avoid headphones and prefer a journal']) {
    assert.ok(sampleMatches(150, 'headphones', '', [reaction]).every(product => !/headphones/i.test(product.name)));
    assert.deepEqual(constrainProducts([{ name: 'Headphones', category: 'Audio', price: 40, url: 'https://shop.test/acme' }], 50, '', new Set(['https://shop.test/acme']), [reaction]), []);
  }
  assert.ok(preferences('', ['no headphones and prefer a journal']).positives.join(' ').includes('journal'));
  assert.ok(!preferences('', ['no headphones']).positives.join(' ').includes('headphones'));
  assert.deepEqual(constrainProducts([{ name: 'Headphones', category: 'Audio', price: 40, url: 'https://shop.test/acme' }], 50, 'no headphones', new Set(['https://shop.test/acme'])), []);
});
test('cost fields require cited excerpts and known totals enforce the full budget', async () => {
  const product = await evidencedProduct(candidate(), research);
  assert.equal(product.pricing.total, 45); assert.equal(product.totalCostKnown, true);
  assert.deepEqual(constrainProducts([product], 44, '', new Set([product.url])), []);
  const unknown = candidate(); unknown.pricing.evidence = unknown.pricing.evidence.filter(fact => fact.field !== 'shipping');
  const partial = await evidencedProduct(unknown, research);
  assert.equal(partial.pricing.shipping, null); assert.equal(partial.pricing.total, null); assert.equal(partial.totalCostKnown, false);
});
test('known mandatory charges cannot be hidden by an unknown total', async () => {
  const product = await evidencedProduct(candidate(), research);
  product.pricing.total = null; product.pricing.shipping = 15; product.pricing.tax = null;
  assert.deepEqual(constrainProducts([product], 50, '', new Set([product.url])), []);
});
test('a lack of ownership is not treated as an exclusion', () => {
  assert.deepEqual(preferences('', ["I don't have headphones", 'headphones that have good battery life']).excluded, []);
});
test('retailer visits preserve purchase status and satisfaction, including legacy IDs', async () => {
  const product = await evidencedProduct(candidate(), research);
  const saved = [{ ...product, id: 'old-random-id', decision: 'bought', feedback: 'Love it and use it', savedAt: '2026-10-24T00:00:00Z' }];
  const result = upsertSaved(saved, product, 'visited', '2026-10-25T00:00:00Z');
  assert.equal(result.length, 1); assert.equal(result[0].decision, 'bought'); assert.equal(result[0].feedback, saved[0].feedback);
});
test('a retrieved URL without supporting citations, invented prices and other currencies are rejected', async () => {
  assert.equal(await evidencedProduct(candidate(), { ...research, passages: [] }), null);
  const wrong = candidate(); wrong.pricing.item = 20; assert.equal(await evidencedProduct(wrong, research), null);
  wrong.pricing.currency = 'USD'; assert.equal(await evidencedProduct(wrong, research), null);
  const invented = candidate(); invented.pricing.evidence[1].quote = 'Item S$1'; assert.equal(await evidencedProduct(invented, research), null);
  const otherModel = candidate(); otherModel.name = 'Different model'; assert.equal(await evidencedProduct(otherModel, research), null);
});
test('a citation passage cannot be borrowed from a different product URL', async () => {
  assert.equal(await evidencedProduct(candidate(), { ...research, passages: [{ url: 'https://other.test', text: research.text }] }), null);
});
test('a price for another model on the same merchant page is rejected', async () => {
  const other = candidate(); other.pricing.item = 20;
  other.pricing.evidence[1].quote = 'Other Headphones item S$20.';
  const mixed = { ...research, passages: [{ ...research.passages[0], text: research.text + ' Other Headphones item S$20.' }] };
  assert.equal(await evidencedProduct(other, mixed), null);
});
test('only known discussion-thread URLs qualify as community sources', () => {
  assert.equal(discussionURL('https://www.reddit.com/r/audio/comments/abc/review'), true);
  for (const url of ['https://reddit.com/search?q=audio', 'https://reddit.com.evil.test/r/audio/comments/abc', 'https://merchant.test/reviews', 'https://www.reddit.com/r/audio/']) assert.equal(discussionURL(url), false);
});
test('stable identifiers and history survive tracking links and model regeneration', async () => {
  const product = candidate();
  assert.equal(await stableProductId(product), await stableProductId({ ...product, url: product.url + '?utm_source=search#price' }));
  assert.equal(rejectedByHistory(product, [{ ...product, decision: 'bought' }]), true);
  assert.equal(rejectedByHistory(product, [{ ...product, name: 'Other model', url: 'https://other.test', decision: 'saved' }]), false);
});
test('search results are not treated as cited passages unless annotations support them', () => {
  const text = 'Acme costs S$40. [1]\nOther claim.';
  const result = extractResearch({ output: [{ type: 'web_search_call', action: { sources: [{ url: 'https://uncited.test' }] } }, { content: [{ type: 'output_text', text, annotations: [{ type: 'url_citation', url: 'https://shop.test', start_index: 16, end_index: 19 }] }] }] });
  assert.equal(result.sources.length, 2); assert.equal(result.passages.length, 1);
  assert.equal(result.passages[0].text.includes('Other claim'), false);
});

test('zero fees require unconditional affirmative evidence, not negated or conditional wording', async () => {
  for (const [field, quote, supported] of [
    ['shipping', 'Shipping not included.', false],
    ['shipping', 'Shipping is not free.', false],
    ['shipping', 'Free shipping over S$50.', false],
    ['shipping', 'Shipping S$0 if minimum spend is met.', false],
    ['tax', 'Tax excluded.', false],
    ['tax', 'Tax not included.', false],
    ['shipping', 'Free shipping.', true],
    ['shipping', 'Shipping included in the price.', true],
    ['shipping', 'No delivery charges.', true],
    ['tax', 'GST included.', true],
    ['tax', 'Tax included S$0.', true],
  ]) {
    const value = candidate(); value.pricing[field] = 0;
    value.pricing.total = 40 + (field === 'shipping' ? 0 : 5);
    value.pricing.evidence.find(f => f.field === field).quote = quote;
    value.pricing.evidence.find(f => f.field === 'total').quote = `Total S$${value.pricing.total}.`;
    const text = value.pricing.evidence.map(f => f.quote).join(' ');
    const product = await evidencedProduct(value, { text, sources: research.sources, passages: [{ url: value.url, text }] });
    assert.equal(product.pricing[field], supported ? 0 : null, quote);
    assert.equal(product.totalCostKnown, supported, quote);
  }
});
