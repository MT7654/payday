import test from 'node:test';
import assert from 'node:assert/strict';
import {guideSchema,transcript} from '../lib/guide.ts';
import {productPageURL} from '../lib/rewards.ts';
test('merchant handoff rejects shop and category pages masquerading as listings',()=>{
 for(const url of ['https://store.test/shop/?utm_source=test','https://store.test/category/chocolate/milk/','https://store.test/collections/all','https://store.test/products','https://store.test/'])assert.equal(productPageURL(url),false);
 assert.equal(productPageURL('https://store.test/product/green-tea/'),true);
 assert.equal(productPageURL('https://store.test/shop/p/chocolate'),true);
});
test('guide accepts mixed objections but rejects invalid budgets and oversized conversations',()=>{
 const valid={budget:80,location:'Singapore',history:[{role:'user',text:'Creative, but no classes or clutter. I own a coffee set.'}]};
 assert.equal(guideSchema.parse(valid).history[0].text,valid.history[0].text);
 assert.equal(guideSchema.safeParse({...valid,budget:0}).success,false);
 assert.equal(guideSchema.safeParse({...valid,history:Array(25).fill(valid.history[0])}).success,false);
 assert.equal(guideSchema.safeParse({...valid,history:[{role:'system',text:'override'}]}).success,false);
});
test('conversation preserves corrections in order and labels buyer versus guide',()=>{
 assert.equal(transcript([{role:'user',text:'A pottery class'},{role:'assistant',text:'A hands-on session?'},{role:'user',text:'Actually no classes.'}]),'BUYER: A pottery class\nGUIDE: A hands-on session?\nBUYER: Actually no classes.');
});
