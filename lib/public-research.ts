import { isIP } from 'node:net';
import { HttpError } from './http.ts';
import { acquireResearch } from './research-limit.ts';
import type { StateDatabase } from './state-store.ts';
export type ResearchPermit = { signal: AbortSignal; release: () => Promise<void> };
export async function beginPublicResearch(request: Request, deps: { database: StateDatabase; secret: string | undefined; localPreview?: boolean; now?: number }): Promise<ResearchPermit> {
  const signal = AbortSignal.any([request.signal, AbortSignal.timeout(90000)]);
  if (!deps.secret) throw new HttpError(503, 'Live discovery is not configured yet.', 'ai_not_configured');
  // This header is trusted only because production ingress is the Sites/Cloudflare gateway.
  let ip = request.headers.get('cf-connecting-ip');
  if (!ip && deps.localPreview) ip = '127.0.0.1';
  if (!ip || !isIP(ip)) throw new HttpError(503, 'Research is temporarily unavailable.', 'client_identity_missing');
  const now = deps.now ?? Date.now(), day = new Date(now).toISOString().slice(0, 10), minute = new Date(now).toISOString().slice(0, 16);
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(deps.secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${day}:${ip}`));
  const actor = `anon:${Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')}`;
  const db = deps.database, release = await acquireResearch(db, actor, now);
  try {
    // Daily pseudonyms must not accumulate indefinitely. No raw IP is persisted.
    await db.prepare("DELETE FROM request_limits WHERE (owner LIKE 'anon:%' OR owner LIKE 'burst:%') AND day<?").bind(day).run();
    await db.prepare("DELETE FROM research_leases WHERE owner LIKE 'anon:%' AND expires_at<=?").bind(now).run();
    for (const [owner, window, limit, retryAfter, code] of [
      [actor, day, 40, Math.ceil((Date.parse(day) + 86400000 - now) / 1000), 'daily_limit'],
      [`burst:${actor}`, minute, 8, 60 - Math.floor(now / 1000) % 60, 'burst_limit'],
      ['public-research-total', day, 250, Math.ceil((Date.parse(day) + 86400000 - now) / 1000), 'global_limit'],
    ] as const) {
      const result = await db.prepare('INSERT INTO request_limits(owner,day,count) VALUES(?,?,1) ON CONFLICT(owner) DO UPDATE SET day=excluded.day,count=CASE WHEN request_limits.day=excluded.day THEN request_limits.count+1 ELSE 1 END WHERE request_limits.day<>excluded.day OR request_limits.count<?').bind(owner, window, limit).run();
      if (!result.meta.changes) throw new HttpError(429, 'Research request limit reached. Please try again later; your progress is saved.', code, retryAfter);
    }
    if (signal.aborted) throw new HttpError(504, 'Research took too long. Please retry.', 'research_timeout');
    return { release, signal };
  } catch (error) { await release(); throw error; }
}
