export type SaveStatus = { phase: 'idle' | 'saving' | 'saved' | 'error' | 'conflict'; message?: string };
type Remote<T> = { state: T; revision: number };
const statusOf = (error: unknown) => (error as { status?: number })?.status;
const retryable = (error: unknown) => error instanceof TypeError || statusOf(error) === 429 || (statusOf(error) ?? 0) >= 500;
const same = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  const x = a as Record<string, unknown>, y = b as Record<string, unknown>;
  return Object.keys(x).length === Object.keys(y).length && Object.keys(x).every(key => Object.hasOwn(y, key) && same(x[key], y[key]));
};

export class SaveQueue<T> {
  private revision = 0;
  private pending: T | undefined;
  private running: Promise<void> | undefined;
  private blocked = false;
  private stopped = false;
  private conflicted = false;
  private deps: {
    write: (state: T, revision: number) => Promise<{ revision: number }>;
    read: () => Promise<Remote<T>>;
    notify: (status: SaveStatus) => void;
    wait?: (milliseconds: number) => Promise<void>;
  };
  constructor(deps: SaveQueue<T>['deps']) { this.deps = deps; }
  reset(revision: number) {
    this.revision = revision; this.pending = undefined; this.blocked = false; this.stopped = false; this.conflicted = false;
    this.deps.notify({ phase: 'idle' });
  }
  enqueue(state: T) {
    if (this.stopped) return;
    this.pending = structuredClone(state);
    this.kick();
  }
  get dirty() { return this.pending !== undefined || !!this.running; }
  async settled() { while (this.running) await this.running; }
  retry() { if (this.conflicted || this.stopped) return; this.blocked = false; this.kick(); }
  async stop() { this.stopped = true; this.pending = undefined; await this.settled(); }
  private kick() {
    if (this.running || this.blocked || this.stopped || this.pending === undefined) return;
    this.running = this.drain().finally(() => { this.running = undefined; this.kick(); });
  }
  private async send(snapshot: T) {
    for (let attempt = 0; ; attempt++) {
      try { return await this.deps.write(snapshot, this.revision); }
      catch (error) {
        if (statusOf(error) !== 409 && !retryable(error)) throw error;
        // A lost response may follow a committed write. Read before retrying to avoid duplicate writes.
        try {
          const current = await this.deps.read();
          if (current.revision === this.revision + 1 && same(current.state, snapshot)) return { revision: current.revision };
          if (current.revision !== this.revision) throw Object.assign(new Error('Your rewards changed in another tab. Export unsaved changes before reloading.'), { status: 409 });
        } catch (readError) { if (statusOf(readError) === 409) throw readError; if (!retryable(readError)) throw readError; }
        if (statusOf(error) === 409 || attempt >= 2 || this.stopped) throw error;
        await (this.deps.wait ?? (ms => new Promise(resolve => setTimeout(resolve, ms))))(500 * 2 ** attempt);
      }
    }
  }
  private async drain() {
    while (!this.stopped && !this.blocked && this.pending !== undefined) {
      const snapshot = this.pending;
      this.pending = undefined;
      this.deps.notify({ phase: 'saving' });
      try { this.revision = (await this.send(snapshot)).revision; }
      catch (error) {
        if (this.stopped) return;
        if (this.pending === undefined) this.pending = snapshot;
        this.blocked = true;
        this.conflicted = statusOf(error) === 409;
        this.deps.notify({ phase: this.conflicted ? 'conflict' : 'error', message: error instanceof Error ? error.message : 'Your changes could not be saved.' });
        return;
      }
    }
    if (!this.stopped) this.deps.notify({ phase: 'saved' });
  }
}
