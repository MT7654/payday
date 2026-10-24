import test from 'node:test';
import assert from 'node:assert/strict';
import { occurrence,isDue,nextDate,safeURL,constrainProducts,demoProducts } from '../lib/rewards.ts';
const plan={id:'p',date:'2026-01-31',time:'09:00',timezone:'Asia/Singapore',monthly:true,paused:false,dismissed:[],notified:[],snooze:null};
test('monthly payday clamps to February and respects local reminder time',()=>{
 assert.equal(occurrence(plan,new Date('2026-02-28T00:59:00Z')),null);
 assert.equal(occurrence(plan,new Date('2026-02-28T01:00:00Z')),'p:2026-02-28');
 assert.equal(nextDate(plan,new Date('2026-02-01T00:00:00Z')),'2026-02-28');
 assert.equal(nextDate({...plan,date:'2028-01-31'},new Date('2028-02-01T00:00:00Z')),'2028-02-29');
});
test('dismiss, snooze, pause and future start date suppress reminders',()=>{
 const now=new Date('2026-02-28T01:00:00Z');
 assert.equal(isDue(plan,now),true);
 assert.equal(isDue({...plan,dismissed:['p:2026-02-28']},now),false);
 assert.equal(isDue({...plan,snooze:'2026-03-01T01:00:00Z'},now),false);
 assert.equal(isDue({...plan,paused:true},now),false);
 assert.equal(isDue({...plan,date:'2026-03-31'},now),false);
});
test('one-time overdue reminders survive reopening',()=>{
 assert.equal(isDue({...plan,monthly:false},new Date('2026-03-01T00:00:00Z')),true);
});
test('untrusted URL schemes and embedded credentials are rejected',()=>{
 for(const u of ['javascript:alert(1)','http://shop.test','https://user:pass@shop.test','invalid'])assert.equal(safeURL(u),'');
 assert.equal(safeURL('https://shop.test/item'),'https://shop.test/item');
});
test('recommendations enforce budget, exclusions and retrieved-source membership',()=>{
 const base={name:'Coffee kit',category:'Coffee',price:50,url:'https://shop.test/a'};
 const products=[base,{...base,price:151},{...base,price:NaN},{...base,url:'https://invented.test/a'},{...base,name:'Headphones',category:'Audio'},{...base,price:0}];
 assert.deepEqual(constrainProducts(products,150,'headphones',new Set([base.url])),[base]);
});
test('demo never fabricates retailer URLs or evidence and obeys budget',()=>{
 const products=demoProducts(60,'everyday');assert.ok(products.length);
 assert.ok(products.every(p=>p.price<=60&&p.url===''&&p.mode==='demo'&&p.sources.length===0));
 assert.deepEqual(demoProducts(1,'everyday'),[]);
});
