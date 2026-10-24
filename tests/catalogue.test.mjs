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
