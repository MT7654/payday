import test from 'node:test';
import assert from 'node:assert/strict';
import { SaveQueue } from '../lib/save-queue.ts';
const error = status => Object.assign(new Error('test error'), { status });

test('temporary network failure retries and later edits still save', async () => {
  let remote = { state: {}, revision: 0 }, calls = 0; const phases = [];
  const queue = new SaveQueue({ read: async () => remote, wait: async () => {}, notify: value => phases.push(value.phase), write: async (state, revision) => {
    if (++calls === 1) throw new TypeError('offline');
    assert.equal(revision, remote.revision); remote = { state, revision: revision + 1 }; return remote;
  } });
  queue.enqueue({ title: 'first' }); await queue.settled();
  queue.enqueue({ title: 'second' }); await queue.settled();
  assert.equal(remote.state.title, 'second'); assert.equal(remote.revision, 2); assert.equal(phases.at(-1), 'saved');
});
test('a committed write with a lost response is acknowledged without a second write', async () => {
  let remote = { state: {}, revision: 0 }, calls = 0;
  const queue = new SaveQueue({ read: async () => remote, wait: async () => {}, notify() {}, write: async (state, revision) => {
    calls++; remote = { state: { b: state.b, a: state.a }, revision: revision + 1 }; throw new TypeError('response lost');
  } });
  queue.enqueue({ a: 1, b: 2 }); await queue.settled(); assert.equal(calls, 1); assert.equal(queue.dirty, false);
});
test('exhausted retries preserve latest edits and manual retry recovers', async () => {
  let online = false, remote = { state: {}, revision: 0 }; const phases = [];
  const queue = new SaveQueue({ read: async () => remote, wait: async () => {}, notify: value => phases.push(value.phase), write: async (state, revision) => {
    if (!online) throw error(503); remote = { state, revision: revision + 1 }; return remote;
  } });
  queue.enqueue({ title: 'first' }); await queue.settled();
  assert.equal(queue.dirty, true); assert.equal(phases.at(-1), 'error');
  queue.enqueue({ title: 'latest' }); online = true; queue.retry(); await queue.settled();
  assert.equal(remote.state.title, 'latest'); assert.equal(phases.at(-1), 'saved');
});
test('conflicting or deleted state is never automatically overwritten', async () => {
  let writes = 0; const phases = [];
  const queue = new SaveQueue({ read: async () => ({ state: {}, revision: 2 }), notify: value => phases.push(value.phase), write: async () => { writes++; throw error(409); } });
  queue.reset(1); queue.enqueue({ private: 'old' }); await queue.settled(); queue.retry(); await queue.settled();
  assert.equal(phases.at(-1), 'conflict'); assert.equal(writes, 1); assert.equal(queue.dirty, true);
});
test('deleting waits for in-flight saves and discards pending edits', async () => {
  let finish; let calls = 0;
  const queue = new SaveQueue({ read: async () => ({ state: {}, revision: 0 }), notify() {}, write: async () => { calls++; await new Promise(resolve => finish = resolve); return { revision: 1 }; } });
  queue.enqueue({ title: 'first' }); queue.enqueue({ title: 'pending' }); const stopped = queue.stop(); finish(); await stopped;
  assert.equal(calls, 1); assert.equal(queue.dirty, false);
  queue.reset(2); assert.equal(queue.dirty, false);
});
