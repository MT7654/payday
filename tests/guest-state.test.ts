import test from 'node:test';
import assert from 'node:assert/strict';
import {loadGuestState,saveGuestState} from '../lib/guest-state.ts';
import {emptyState} from '../lib/rewards.ts';
test('guest payday plans survive reload and remain in demo mode',()=>{
 let value:string|null=null;const storage={getItem:()=>value,setItem:(_k:string,v:string)=>{value=v;}};
 const state=structuredClone(emptyState);state.plans.push({id:'test',title:'Saturday art',occasion:'Payday',intention:'Create',budget:80,date:'2026-10-25',time:'10:00',timezone:'Asia/Singapore',monthly:true,paused:false,interests:'',exclusions:'',notified:[],dismissed:[],snooze:null});
 state.settings.mode='live';saveGuestState(storage,state);const restored=loadGuestState(storage);
 assert.equal(restored.plans[0].title,'Saturday art');assert.equal(restored.settings.mode,'demo');assert.equal(restored.plans[0].monthly,true);
});
test('invalid guest storage recovers without breaking the page',()=>{
 for(const raw of ['not json','{}','{"version":1,"state":{"plans":null}}'])assert.deepEqual(loadGuestState({getItem:()=>raw,setItem:()=>{}}),emptyState);
});
test('storage write failures are surfaced rather than reported as saved',()=>{
 assert.throws(()=>saveGuestState({getItem:()=>null,setItem:()=>{throw Error('quota');}},emptyState),/quota/);
});
