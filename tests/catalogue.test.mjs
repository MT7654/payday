import test from 'node:test';
import assert from 'node:assert/strict';
import { catalogue,sampleMatches } from '../lib/catalogue.ts';
test('catalogue contains fifty unique labelled sample ideas with no fake offers',()=>{
 assert.equal(catalogue.length,50);assert.equal(new Set(catalogue.map(x=>x.id)).size,50);
 assert.ok(catalogue.every(p=>p.mode==='demo'&&p.url===''&&p.sources.length===0&&p.price>0));
 assert.equal(new Set(catalogue.map(p=>p.category)).size,5);
});
test('sample shortlist respects budget and explicit exclusions',()=>{
 const picks=sampleMatches(50,'coffee','coffee,tea');
 assert.ok(picks.length<=3);assert.ok(picks.every(p=>p.price<=50&&!/coffee|tea/i.test(p.name+' '+p.category+' '+p.tags.join(' '))));
 assert.deepEqual(sampleMatches(1,'coffee'),[]);
 assert.ok(sampleMatches(150,'pottery')[0].name.toLowerCase().includes('pottery'));
});

import { shortlist } from '../lib/catalogue.ts';
test('guided discovery terminates at three unique affordable ideas',()=>{
 for(const mood of ['Anything',...new Set(catalogue.map(p=>p.mood))])for(const budget of [20,30,50,100,150]){
 const picks=shortlist(mood,budget);assert.ok(picks.length<=3);assert.equal(new Set(picks.map(p=>p.id)).size,picks.length);assert.ok(picks.every(p=>p.price<=budget&&(mood==='Anything'||p.mood===mood)));
 }
});
