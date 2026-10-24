import { z } from 'zod';
import { safeURL } from './rewards.ts';
const text = z.string().max(5000);
const id = z.string().min(1).max(200);
const instant = z.string().max(40).datetime({ offset: true });
const timezone = z.string().max(100).refine(value => {
  try { new Intl.DateTimeFormat('en', { timeZone: value }); return true; } catch { return false; }
});
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
});
const url = z.string().max(4096).refine(value => !!safeURL(value));
const mode = z.enum(['live', 'demo']);
const source = z.object({ url, title: z.string().max(1000) });
export const priceFactSchema = z.object({ field: z.enum(['item', 'shipping', 'tax', 'total', 'model']), url, quote: z.string().min(1).max(2000) });
export const pricingSchema = z.object({
  currency: z.literal('SGD'), item: z.number().finite().positive(),
  shipping: z.number().finite().nonnegative().nullable(), tax: z.number().finite().nonnegative().nullable(),
  total: z.number().finite().positive().nullable(), evidence: z.array(priceFactSchema).max(5), basis: z.literal('search-summary'),
});
const product = z.object({
  id, name: z.string().min(1).max(200), category: z.string().max(200), price: z.number().finite().positive(),
  merchant: z.string().max(200), url: z.union([url, z.literal('')]), reason: text, tradeoff: text,
  checkedAt: z.union([instant, z.literal('')]), sources: z.array(source).max(30), mode,
  totalCostKnown: z.boolean(), art: z.string().max(50),
  pricing: pricingSchema.optional(),
});
const claim = z.object({ text, urls: z.array(url).max(20) });
const evidence = z.object({ summary: text, positives: z.array(claim).max(30), concerns: z.array(claim).max(30), sources: z.array(source).max(30), coverage: text, sentiment: text, checkedAt: instant, mode });
const plan = z.object({
  id, title: z.string().min(1).max(120), occasion: z.string().max(80), intention: z.string().max(500),
  budget: z.number().finite().positive().max(100000), date, time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), timezone,
  monthly: z.boolean(), paused: z.boolean(), interests: z.string().max(1000), exclusions: z.string().max(1000),
  notified: z.array(z.string().max(250)).max(500), dismissed: z.array(z.string().max(250)).max(500), snooze: instant.nullable(),
});
const session = z.object({
  id, planId: id, mode, direction: z.string().max(500), reactions: z.array(z.string().max(1000)).max(30),
  products: z.array(product).max(3), question: text,
  scenarios: z.array(z.object({ title: z.string().max(500), description: text, icon: z.enum(['sun', 'spark', 'gift']) })).max(3),
  evidence: z.record(id, evidence).refine(value => Object.keys(value).length <= 100), stage: z.number().int().min(0).max(2), updatedAt: instant,
});
export const stateSchema = z.object({
  plans: z.array(plan).max(50), sessions: z.array(session).max(100),
  saved: z.array(product.extend({ savedAt: instant, decision: z.enum(['saved', 'visited', 'bought', 'skipped']), feedback: z.string().max(1000).optional() })).max(100),
  settings: z.object({ notifications: z.boolean(), timezone, mode }),
  events: z.array(z.object({ name: z.string().max(100), at: instant, mode })).max(500),
});
export const saveSchema = z.object({ state: stateSchema, revision: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER - 1) });
