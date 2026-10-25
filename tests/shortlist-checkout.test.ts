import test from 'node:test';import assert from 'node:assert/strict';
import {shortlistProduct} from '../lib/shortlist-checkout.ts';
import {checkoutTotal,saveMockOrder} from '../lib/mock-checkout.ts';
test('shortlisted product identity reaches its mock receipt without substitution',()=>{
 const p=shortlistProduct({id:'neo',name:'MacBook Neo',url:'https://www.apple.com/sg/macbook-neo/',source:'apple.com',kind:'saved',intent:'me'} as any,1500);
 assert.equal(p.name,'MacBook Neo');assert.equal(p.url,'https://www.apple.com/sg/macbook-neo/');assert.equal(p.mode,'demo');assert.equal(p.totalCostKnown,false);
 const data=new Map();saveMockOrder({getItem:(k:string)=>data.get(k)||null,setItem:(k:string,v:string)=>{data.set(k,v)}} as any,{id:'TEST-NEO',kind:'mock',productId:p.id,name:p.name,quantity:1,total:checkoutTotal(999,1,1500),createdAt:new Date().toISOString(),fulfilment:'delivery'});
 const orders=JSON.parse(data.get('payday-mock-orders-v1'));assert.equal(orders[0].name,'MacBook Neo');assert.equal(orders[0].total,999);
});
