import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyMemory,parseMemory,nextPayday,personalContext,sampleMemory,demoDirection} from '../lib/assistant-memory.ts';
import {newJournal} from '../lib/journey.ts';
test('invalid or tampered saved context falls back without crashing',()=>{
 assert.deepEqual(parseMemory('{broken'),emptyMemory());
 assert.deepEqual(parseMemory(JSON.stringify({...emptyMemory(),budget:-5})),emptyMemory());
 assert.deepEqual(parseMemory(JSON.stringify({...emptyMemory(),payday:32})),emptyMemory());
});
test('payday handles short months, today, and a passed payday',()=>{
 assert.equal(nextPayday(31,new Date(2026,1,1)).getDate(),28);
 assert.equal(nextPayday(25,new Date(2026,9,25,17)).getMonth(),9);
 assert.equal(nextPayday(25,new Date(2026,9,26)).getMonth(),10);
});
test('memory keeps gifts, returns and wishes distinct from ownership',()=>{
 const m=sampleMemory();m.items[0].status='gift';
 const j=newJournal();j.wishes.push({id:'w',title:'Camera',url:'',price:null,addedAt:''});
 const c=personalContext(m,j);assert.match(c,/Watercolour paint set: gift/);assert.match(c,/Saved wish, not owned: Camera/);
 assert.equal(personalContext(emptyMemory(),newJournal()),'');
});
test('sample feedback changes direction and ownership correction changes preparation',()=>{
 assert.equal(demoDirection(undefined,true).cost,0);
 assert.notEqual(demoDirection(undefined,false).title,demoDirection(undefined,true).title);
 assert.equal(demoDirection('unused',true).title,'A quiet museum afternoon');
 assert.equal(demoDirection('not-worth-it',true).title,'A quiet museum afternoon');
 assert.notEqual(demoDirection('enjoyed',true).title,demoDirection('unused',true).title);
});
