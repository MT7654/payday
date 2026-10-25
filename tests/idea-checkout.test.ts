import test from 'node:test';import assert from 'node:assert/strict';
import {ideaCheckout} from '../lib/idea-checkout.ts';import {newJourney,type Idea} from '../lib/journey.ts';import {checkoutTotal} from '../lib/mock-checkout.ts';
const idea:Idea={id:'constructed-custom',title:'Stable Desk Organizer Set',description:'A tidier desk',reason:'Keep everyday essentials in reach.',practical:'Check dimensions',minCost:35,maxCost:60,art:'gift',keywords:['desk']};
test('any selected concept reaches a payable mock product without live merchant data',()=>{
 for(const title of ['Stable Desk Organizer Set','MacBook Neo','A pottery afternoon','An unfamiliar item']){
  const p=ideaCheckout({...idea,title},newJourney(80).brief);assert.equal(p.name,title);assert.equal(p.mode,'demo');assert.equal(p.merchant,'Payday');assert.equal(p.url,'');assert.deepEqual(p.sources,[]);assert.equal(p.checkedAt,'');assert.equal(p.totalCostKnown,false);assert.equal(checkoutTotal(p.price,1,80),35);
 }
});
test('mock pricing stays within budget without claiming a live offer',()=>{
 for(const minCost of [0,-1,NaN,Infinity,999]){const p=ideaCheckout({...idea,minCost},newJourney(10).brief);assert.ok(p.price>0&&p.price<=10);assert.match(p.tradeoff,/Illustrative/);assert.equal(checkoutTotal(p.price,1,10),p.price);}
 assert.throws(()=>ideaCheckout(idea,newJourney(NaN).brief));
});
test('empty research recovery preserves the selected brief and experience checkout',()=>{
 const b={...newJourney(80).brief,situation:'Stable Desk Organizer Set'};assert.equal(ideaCheckout(null,b).name,b.situation);
 assert.equal(ideaCheckout(idea,{...b,format:'do'}).category,'Experiences');
});
