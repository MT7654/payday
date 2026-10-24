import { z } from 'zod';
import { pricingSchema } from './state-schema.ts';
import { safeURL, type Source, type Product, type PriceFact } from './rewards.ts';
import { stableProductId } from './preferences.ts';

export type CitationPassage = { url: string; text: string };
export type Research = { text: string; sources: Source[]; passages: CitationPassage[] };
const tidy = (value: string) => value.replace(/\s+/g, ' ').trim().toLowerCase();
export function supportedQuote(fact: { url: string; quote: string }, research: Research) {
  return !!safeURL(fact.url) && research.sources.some(source => source.url === fact.url) && research.passages.some(passage => passage.url === fact.url && tidy(passage.text).includes(tidy(fact.quote))) && fact.quote.trim().length > 0;
}
export function discussionURL(raw: string) {
  try {
    const url = new URL(raw);
    if (!safeURL(raw)) return false;
    const host = url.hostname.replace(/^(www|old)\./, '');
    return (host === 'reddit.com' && /^\/r\/[^/]+\/comments\/[^/]+/i.test(url.pathname)) ||
      (host === 'forums.hardwarezone.com.sg' && /^\/threads\//.test(url.pathname)) ||
      (host === 'head-fi.org' && /^\/threads\//.test(url.pathname));
  } catch { return false; }
}
const candidateSchema = z.object({
  name: z.string().min(1).max(200), category: z.string().max(200), merchant: z.string().max(200), url: z.string().max(4096),
  reason: z.string().max(5000), tradeoff: z.string().max(5000),
  art: z.enum(['headphones', 'coffee', 'bag', 'journal', 'watch', 'pottery', 'trip', 'camera', 'gift']),
  pricing: pricingSchema.omit({ basis: true }),
});
const cents = (number: number) => Math.round(number * 100);
function supportsAmount(fact: PriceFact, amount: number) {
  const fieldLabel = { item: /./, shipping: /shipping|delivery/i, tax: /tax|gst/i, total: /total|all.in/i, model: /./ }[fact.field];
  if (!fieldLabel.test(fact.quote)) return false;
  const values = [...fact.quote.matchAll(/(?:S\$|SGD\s*\$?)\s*([\d,]+(?:\.\d{1,2})?)/gi)].map(match => cents(Number(match[1].replaceAll(',', ''))));
  if (amount === 0 && values.length === 0 && /free|included|no (?:shipping|delivery|tax|gst)/i.test(fact.quote)) return true;
  // Require one unambiguous SGD amount in each cost excerpt.
  return values.length === 1 && values[0] === cents(amount);
}

export async function evidencedProduct(raw: unknown, research: Research): Promise<Product | null> {
  const parsed = candidateSchema.safeParse(raw);
  if (!parsed.success) return null;
  const candidate = parsed.data;
  if (!safeURL(candidate.url) || discussionURL(candidate.url)) return null;
  const facts = candidate.pricing.evidence.filter(fact => fact.url === candidate.url && supportedQuote(fact, research));
  if (!facts.some(fact => fact.field === 'model' && tidy(fact.quote).includes(tidy(candidate.name)))) return null;
  if (!facts.some(fact => fact.field === 'item' && tidy(fact.quote).includes(tidy(candidate.name)) && supportsAmount(fact, candidate.pricing.item))) return null;
  const supported = (field: 'shipping' | 'tax' | 'total') => {
    const amount = candidate.pricing[field];
    return amount !== null && facts.some(fact => fact.field === field && supportsAmount(fact, amount)) ? amount : null;
  };
  const shipping = supported('shipping'), tax = supported('tax');
  let total = supported('total');
  // Only call a total known when all mandatory components are represented and reconcile.
  if (shipping === null || tax === null || total === null || cents(total) !== cents(candidate.pricing.item) + cents(shipping) + cents(tax)) total = null;
  const pricing = { ...candidate.pricing, shipping, tax, total, evidence: facts, basis: 'search-summary' as const };
  const { pricing: _pricing, ...fields } = candidate;
  return { ...fields, id: await stableProductId(candidate), price: pricing.item, pricing, totalCostKnown: total !== null,
    checkedAt: new Date().toISOString(), sources: research.sources.filter(source => source.url === candidate.url), mode: 'live' };
}

export function extractResearch(data: { output?: any[] }): Research {
  let text = '';
  const sources: Source[] = [], passages: CitationPassage[] = [];
  for (const item of data.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type !== 'output_text' || typeof content.text !== 'string') continue;
      text += content.text + '\n';
      for (const citation of content.annotations ?? []) {
        if (citation.type !== 'url_citation' || !safeURL(citation.url)) continue;
        sources.push({ url: citation.url, title: citation.title || new URL(citation.url).hostname });
        if (!Number.isInteger(citation.start_index) || !Number.isInteger(citation.end_index) || citation.start_index < 0 || citation.end_index > content.text.length) continue;
        const start = content.text.lastIndexOf('\n', Math.max(0, citation.start_index - 1)) + 1;
        passages.push({ url: citation.url, text: content.text.slice(start, citation.end_index) });
      }
    }
    for (const source of item.action?.sources ?? []) if (safeURL(source.url)) sources.push({ url: source.url, title: source.title || new URL(source.url).hostname });
  }
  return { text, passages, sources: [...new Map(sources.map(source => [source.url, source])).values()] };
}
