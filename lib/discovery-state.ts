import { emptyState } from './rewards.ts';
import { readState, type StateDatabase } from './state-store.ts';
export function discoveryState(identity: () => Promise<{ userId: string } | null>, database: () => StateDatabase) {
  return async () => {
    const user = await identity();
    return user ? (await readState(database(), user.userId)).state : structuredClone(emptyState);
  };
}
