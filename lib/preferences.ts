import type { Product, Saved, State } from './rewards.ts';
const negative = /\b(?:no|without|avoid|exclude|skip|not interested in|(?:i\s+)?(?:do not|don't|don’t)\s+(?:want|like|need)|i\s+(?:already\s+)?(?:own|have)|already\s+(?:own|have)|own)\s+([^,;.!?\n]+)/gi;
const normalize = (value: string) => value.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const phrase = (value: string) => normalize(value).split(' ').map(word => word.length > 3 ? word.replace(/s$/, '') : word).join(' ');
const clean = (value: string) => value.replace(/^(?:i\s+)?(?:already\s+)?(?:have|own|no|avoid|exclude|without|skip)\s+/i, '').replace(/^(?:any|a|an|the|more|new)\s+/i, '').replace(/\s+(?:please|already|anymore)$/i, '').trim();
export function preferences(exclusions: string, reactions: string[] = []) {
  const terms: string[] = [];
  const splitTerms = (value: string) => value.split(/\s+(?:and|or)\s+/i).map(clean).filter(Boolean);
  for (const part of exclusions.split(/[,;\n]/).filter(Boolean)) {
    const matches = [...part.matchAll(negative)];
    terms.push(...(matches.length ? matches.flatMap(match => splitTerms(match[1])) : splitTerms(part)));
  }
  const positives = reactions.map(reaction => reaction.replace(negative, (_match, words: string) => {
    const [denied, ...rest] = words.split(/\s+(?:and|but)\s+(?=(?:i\s+)?(?:prefer|like|want|love|need)\b)/i);
    terms.push(...splitTerms(denied));
    return rest.join(' ');
  }));
  return { excluded: [...new Set(terms.map(phrase).filter(Boolean))], positives };
}
export function matchesExclusion(text: string, terms: string[]) {
  const haystack = ` ${phrase(text)} `;
  return terms.some(term => haystack.includes(` ${phrase(term)} `));
}
export function canonicalProductURL(raw: string) {
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' || url.username || url.password) return '';
    url.hash = '';
    for (const key of [...url.searchParams.keys()]) if (/^(utm_|gclid$|fbclid$)/i.test(key)) url.searchParams.delete(key);
    url.searchParams.sort();
    return url.href;
  } catch { return ''; }
}
export function preferenceHistory(state: State) {
  return state.saved.slice(0, 100).map(({ name, category, decision, feedback, url }) => ({ name, category, decision, feedback: feedback ?? '', url }));
}
export function rejectedByHistory(product: Pick<Product, 'name' | 'url'>, saved: Pick<Saved, 'name' | 'url' | 'decision' | 'feedback'>[]) {
  return saved.some(item => {
    const blocked = item.decision === 'bought' || item.decision === 'skipped' || /returned|regret/i.test(item.feedback ?? '');
    return blocked && (phrase(item.name) === phrase(product.name) || (!!canonicalProductURL(item.url) && canonicalProductURL(item.url) === canonicalProductURL(product.url)));
  });
}
export async function stableProductId(product: Pick<Product, 'name' | 'url'>) {
  const key = canonicalProductURL(product.url) || phrase(product.name);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key));
  return 'live-' + Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

export function upsertSaved(saved: Saved[], product: Product, decision: Saved['decision'], savedAt: string): Saved[] {
  const matches = (item: Saved) => item.id === product.id || (!!canonicalProductURL(item.url) && canonicalProductURL(item.url) === canonicalProductURL(product.url));
  const previous = saved.find(matches);
  const preserveDecision = (decision === 'visited' || decision === 'saved') && (previous?.decision === 'bought' || previous?.decision === 'skipped');
  return [{ ...previous, ...product, savedAt, decision: preserveDecision ? previous.decision : decision }, ...saved.filter(item => !matches(item))].slice(0, 100);
}
