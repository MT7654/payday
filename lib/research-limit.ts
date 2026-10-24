import { HttpError } from './http.ts';
import type { StateDatabase } from './state-store.ts';
import { event } from './telemetry.ts';

// A database lease coordinates isolates; an in-memory semaphore cannot do that.
// The lease outlives the 90-second provider deadline, and recovers after a crashed worker.
export async function acquireResearch(db: StateDatabase, owner: string, now = Date.now()) {
  const token = crypto.randomUUID();
  const row = await db.prepare('INSERT INTO research_leases(owner,token,expires_at) VALUES(?,?,?) ON CONFLICT(owner) DO UPDATE SET token=excluded.token,expires_at=excluded.expires_at WHERE research_leases.expires_at<=? RETURNING token')
    .bind(owner, token, now + 120000, now).first();
  if (!row) throw new HttpError(429, 'Research is already running. Please wait for it to finish.', 'research_busy', 5);
  return async () => {
    try { await db.prepare('DELETE FROM research_leases WHERE owner=? AND token=?').bind(owner, token).run(); }
    catch { event('lease.release_failed', { code: 'storage_error' }); }
  };
}
