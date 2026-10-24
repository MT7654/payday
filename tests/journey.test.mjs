import test from 'node:test';
import assert from 'node:assert/strict';
import {newJourney,localIdeas,localProducts,canReview,recordDecision} from '../lib/journey.ts';
test('life situation changes discovery and rejected ideas stay absent',()=>{
 const b={...newJourney().brief,intention:'everyday',situation:'Mornings'};
 const morning=localIdeas(b),commute=localIdeas({...b,situation:'Commute'});
 assert.ok(morning.length>0&&morning.length<=3);
 assert.notEqual(morning[0].title,commute[0].title);
 assert.ok(localIdeas(b,[{id:morning[0].id,title:morning[0].title,reason:'Already own this'}]).every(x=>x.title!==morning[0].title));
});
test('experience prices are for all participants and never exceed the budget',()=>{
 const b={...newJourney(150).brief,entry:'fit',query:'pottery',people:2,format:'do'};
 const picks=localProducts(b,null);assert.ok(picks.length);assert.equal(picks[0].price,150);
 assert.deepEqual(localProducts({...b,budget:149},null),[]);
});
test('owned items and exclusions cannot appear in sample results',()=>{
 const b={...newJourney().brief,query:'coffee tea',owns:'coffee',exclusions:'tea'};
 assert.deepEqual(localProducts(b,null),[]);
 assert.deepEqual(localIdeas({...b,budget:1,intention:'everyday',situation:'Mornings'}),[]);
});
test('format and hobby affect the shortlist',()=>{
 const b={...newJourney().brief,intention:'hobby',situation:'Gardening'};
 assert.match(localIdeas(b)[0].title,/gardening/);
 const ideas=localIdeas({...b,intention:'memory',situation:'Outside',format:'do'});
 for(const idea of ideas)assert.ok(localProducts({...b,format:'do'},idea).every(p=>p.category==='Experiences'));
});
test('a later merchant visit preserves a purchase and its feedback',()=>{
 const f={decision:'bought',feedback:'Enjoyable',satisfaction:'Yes'};
 assert.deepEqual(recordDecision(f,'visited'),f);
});
test('experience feedback waits until the experience date',()=>{
 assert.equal(canReview({decision:'bought',experienceDate:'2026-11-01'},'2026-10-24'),false);
 assert.equal(canReview({decision:'bought',experienceDate:'2026-11-01'},'2026-11-01'),true);
 assert.equal(canReview({decision:'saved'},'2026-11-01'),false);
});
