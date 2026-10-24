import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { emptyState } from '../lib/rewards.ts';

export function database() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(readFileSync(new URL('../drizzle/0000_special_warhawk.sql', import.meta.url), 'utf8'));
  return {
    sqlite,
    prepare(sql) {
      return { bind(...values) {
        return {
          async first() { return sqlite.prepare(sql).get(...values) ?? null; },
          async run() { const result = sqlite.prepare(sql).run(...values); return { meta: { changes: Number(result.changes) } }; },
        };
      } };
    },
  };
}
export const plan = { id: 'p', title: 'A reward', occasion: 'Payday', intention: 'A little comfort', budget: 50, date: '2026-10-31', time: '18:00', timezone: 'Asia/Singapore', monthly: true, paused: false, interests: '', exclusions: '', notified: [], dismissed: [], snooze: null };
export const state = () => ({ ...structuredClone(emptyState), plans: [structuredClone(plan)] });
export const request = (body, method = 'PUT') => new Request('https://payday.test/api/state', { method, headers: { origin: 'https://payday.test', 'content-type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
export const research = {
  text: 'Acme Headphones. Acme Headphones item S$40. Shipping S$5. Tax included S$0. Total S$45.',
  sources: [{ url: 'https://shop.test/acme', title: 'Acme' }],
  passages: [{ url: 'https://shop.test/acme', text: 'Acme Headphones. Acme Headphones item S$40. Shipping S$5. Tax included S$0. Total S$45.' }],
};
export const candidate = () => ({ name: 'Acme Headphones', category: 'Audio', merchant: 'Shop', url: 'https://shop.test/acme', reason: 'Compact', tradeoff: 'Check fit', art: 'headphones', pricing: {
  currency: 'SGD', item: 40, shipping: 5, tax: 0, total: 45,
  evidence: ['model', 'item', 'shipping', 'tax', 'total'].map((field, i) => ({ field, url: 'https://shop.test/acme', quote: ['Acme Headphones.', 'Acme Headphones item S$40.', 'Shipping S$5.', 'Tax included S$0.', 'Total S$45.'][i] })),
} });
