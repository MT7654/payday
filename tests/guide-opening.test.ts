import test from 'node:test';
import assert from 'node:assert/strict';
import {guideHandler} from '../lib/guide-api.ts';
import {guideOpening} from '../lib/guide-opening.ts';
import {browserContext} from '../lib/browser-interests.ts';

const item={id:'audio',name:'Wireless headphones',url:'https://shop.test/headphones',source:'shop.test',kind:'saved' as const,intent:'me' as const,seenAt:'2026-10-25'};
test('a saved headphone opens with optional themes, not product intent',()=>{
 const result=guideOpening(browserContext({items:[item],ignored:[]}));
 assert.deepEqual(result.answers,['Music and podcasts','A little quiet','Something different']);
 assert.doesNotMatch(JSON.stringify(result),/headphone|you saved|you browsed/i);
 assert.deepEqual(result.ideas,[]);assert.deepEqual(result.brief.keep,[]);assert.equal(result.brief.goal,'');
});
test('excluded interests and unknown items do not force a theme',()=>{
 for(const candidate of [{...item,intent:'gift' as const},{...item,intent:'browsing' as const},{...item,name:'Unrecognised object'}]){
  assert.deepEqual(guideOpening(browserContext({items:[candidate],ignored:[]})).answers,['Time to unwind','Something new to try','A better daily routine']);
 }
});
test('automatic opening skips paid research; explicit requests and later replies reach AI',async()=>{
 let called=0;
 const handler=guideHandler({begin:async()=>({signal:new AbortController().signal,release:async()=>{}}),structured:async()=>{called++;return guideOpening('');}});
 async function send(opening:boolean,history:{role:'user'|'assistant';text:string}[]){return handler(new Request('https://payday.test/api/guide',{method:'POST',headers:{Origin:'https://payday.test','Content-Type':'application/json'},body:JSON.stringify({budget:80,location:'Singapore',opening,context:browserContext({items:[item],ignored:[]}),history})}));}
 const first=await send(true,[{role:'user',text:'Prepare something for me'}]);assert.equal(first.status,200);assert.equal(called,0);
 await send(false,[{role:'user',text:'Compare headphones'}]);assert.equal(called,1);
 await send(true,[{role:'user',text:'Prepare something'},{role:'assistant',text:'What would you like more of?'},{role:'user',text:'Something different'}]);assert.equal(called,2);
});
