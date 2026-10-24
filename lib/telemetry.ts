import { AsyncLocalStorage } from 'node:async_hooks';

type Context = { requestId: string; route: string; method: string; sink: (event: Record<string, unknown>) => void };
const contexts = new AsyncLocalStorage<Context>();
export function requestId() { return contexts.getStore()?.requestId; }
// Only these bounded, non-content fields can enter application logs. Never log raw errors.
type Fields = { status?: number; durationMs?: number; code?: string; search?: boolean; inputTokens?: number; outputTokens?: number };
export function event(name: 'request.completed' | 'request.failed' | 'ai.completed' | 'ai.failed' | 'lease.release_failed', fields: Fields = {}) {
  const context = contexts.getStore();
  if (!context) return;
  const record: Record<string, unknown> = { event: name, timestamp: new Date().toISOString(), requestId: context.requestId, route: context.route, method: context.method };
  for (const key of ['status', 'durationMs', 'inputTokens', 'outputTokens'] as const) {
    const value = fields[key];
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) record[key] = Math.round(value);
  }
  if (typeof fields.search === 'boolean') record.search = fields.search;
  // Codes must be chosen by application code, never error messages or provider payloads.
  if (fields.code && /^[a-z_]{1,40}$/.test(fields.code)) record.code = fields.code;
  try { context.sink(record); } catch { /* A logging outage must not fail a save. */ }
}
export function withRequestContext<T>(request: Request, run: () => T, sink = (record: Record<string, unknown>) => console.log(JSON.stringify(record))): T {
  const path = new URL(request.url).pathname;
  const route = ['/api/state', '/api/discover', '/api/guide', '/api/connections', '/'].includes(path) ? path : 'other';
  const method = ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'OPTIONS', 'PATCH'].includes(request.method) ? request.method : 'OTHER';
  // Ignore caller-supplied IDs: no log injection, PII, or cross-request attribution.
  return contexts.run({ requestId: crypto.randomUUID(), route, method, sink }, run);
}
