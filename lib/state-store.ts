import { emptyState, type State } from './rewards.ts';
import { stateSchema } from './state-schema.ts';
import { HttpError } from './http.ts';
export type StateDatabase = Pick<D1Database, 'prepare'>;
export async function readState(db: StateDatabase, owner: string) {
  const row = await db.prepare('SELECT body,revision FROM reward_states WHERE owner=?').bind(owner).first<{ body: string; revision: number }>();
  return { state: row ? stateSchema.parse(JSON.parse(row.body)) : structuredClone(emptyState), revision: row?.revision ?? 0 };
}
export async function writeState(db: StateDatabase, owner: string, state: State, revision: number) {
  const row = await db.prepare(`
    INSERT INTO reward_states(owner,body,revision,updated_at)
    SELECT ?,?,1,? WHERE ?=0 OR EXISTS(SELECT 1 FROM reward_states WHERE owner=?)
    ON CONFLICT(owner) DO UPDATE SET body=excluded.body,revision=reward_states.revision+1,updated_at=excluded.updated_at
    WHERE reward_states.revision=? RETURNING revision
  `).bind(owner, JSON.stringify(state), new Date().toISOString(), revision, owner, revision).first<{ revision: number }>();
  if (!row) throw new HttpError(409, 'Your rewards changed in another tab. Export unsaved changes before reloading.');
  return row;
}
export async function clearState(db: StateDatabase, owner: string) {
  // Keep empty content and a monotonic revision so stale tabs cannot restore deleted data.
  return await db.prepare(`
    INSERT INTO reward_states(owner,body,revision,updated_at) VALUES(?,?,1,?)
    ON CONFLICT(owner) DO UPDATE SET body=excluded.body,revision=reward_states.revision+1,updated_at=excluded.updated_at
    RETURNING revision
  `).bind(owner, JSON.stringify(emptyState), new Date().toISOString()).first<{ revision: number }>();
}
