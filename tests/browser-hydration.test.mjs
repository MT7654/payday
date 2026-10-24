import test from 'node:test';
import assert from 'node:assert/strict';
import {browserHydration} from '../lib/browser-hydration.ts';

test('storage hydration runs after the initial render and cancels an unmounted read',async()=>{
 const reads=[];
 const cancel=browserHydration(()=>reads.push('unmounted'));
 cancel();
 browserHydration(()=>reads.push('mounted'));
 assert.deepEqual(reads,[]);
 await Promise.resolve();
 assert.deepEqual(reads,['mounted']);
});
