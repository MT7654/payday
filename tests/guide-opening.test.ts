import test from 'node:test';
import type {GuideReply} from '../lib/guide';
import assert from 'node:assert/strict';
import {guideHandler} from '../lib/guide-api.ts';
import {guideOpening,summarizeInterests} from '../lib/guide-opening.ts';
import {browserContext} from '../lib/browser-interests.ts';

const item={id:'audio',name:'Wireless headphones',url:'https://shop.test/headphones',source:'shop.test',kind:'saved' as const,intent:'me' as const,seenAt:'2026-10-25'};
test('a saved headphone opens with optional themes, not product intent',()=>{
 const result=guideOpening(browserContext({items:[item],ignored:[]}));
 assert.deepEqual(result.answers,['Music and listening','A little quiet','Something different']);
 assert.doesNotMatch(JSON.stringify(result),/headphone|you saved|you browsed/i);
 assert.deepEqual(result.ideas,[]);assert.deepEqual(result.brief.keep,[]);assert.equal(result.brief.goal,'');
});
test('excluded interests and unknown items do not force a theme',()=>{
 for(const candidate of [{...item,intent:'gift' as const},{...item,intent:'browsing' as const},{...item,name:'Unrecognised object'}]){
  assert.deepEqual(guideOpening(browserContext({items:[candidate],ignored:[]})).answers,['Draining','Restless','Pretty good']);
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

test('category frequency beats item order, includes all 100 inputs, and counts each URL once',()=>{
 const inputs=[{name:'Wireless headphones',url:'https://shop.test/audio',intent:'me' as const},...Array.from({length:20},(_,i)=>({name:'Watercolour paint set',url:'https://shop.test/paint/'+i,intent:'me' as const})),{name:'Coffee grinder',url:'https://shop.test/coffee',intent:'me' as const}];
 const result=summarizeInterests([...inputs,{...inputs[0],url:inputs[0].url+'?tracking=1'}, {...inputs[0],url:inputs[0].url+'/'}]);
 assert.equal(result.total,22);assert.equal(result.matched,22);assert.deepEqual(result.categories.map(x=>[x.label,x.count]),[['Creativity',20],['Audio',1],['Food and drink',1]]);
 assert.deepEqual(summarizeInterests([...inputs].reverse()),result);
 assert.deepEqual(guideOpening('',inputs).answers,['A creative break','Music and listening','Something different']);
});
test('empty and unrecognised shortlists begin with the week; supplied empty list overrides old context',()=>{
 for(const result of [guideOpening('',[]),guideOpening(browserContext({items:[item],ignored:[]}),[])]){assert.match(result.question,/week felt/);assert.equal(result.discovery?.stage,'week');assert.equal(result.ideas.length,0);}
 const unknown=guideOpening('',[{name:'Object Q',url:'https://shop.test/q',intent:'me'}]);assert.equal(unknown.discovery?.total,1);assert.equal(unknown.discovery?.matched,0);assert.equal(unknown.discovery?.stage,'week');
});
test('mood choices ask about desired feeling before recommending; a different theme returns to the week',async()=>{
 let called=0;const handler=guideHandler({begin:async()=>({signal:new AbortController().signal,release:async()=>{}}),structured:async()=>{called++;return guideOpening('');}});
 async function send(stage:string,text:string){const r=await handler(new Request('https://payday.test/api/guide',{method:'POST',headers:{Origin:'https://payday.test','Content-Type':'application/json'},body:JSON.stringify({budget:80,location:'Singapore',interests:[],discoveryStage:stage,history:[{role:'user',text:'Help me discover'},{role:'assistant',text:'How has this week felt overall?'},{role:'user',text}]})}));assert.equal(r.status,200);return r.json() as Promise<GuideReply>;}
 const mood=await send('week','Draining');assert.equal(mood.discovery?.stage,'feeling');assert.equal(mood.ideas.length,0);assert.deepEqual(mood.answers,['Calmer','More energised','More connected']);
 const different=await send('themes','Something different');assert.equal(different.discovery?.stage,'week');assert.equal(called,0);
 await send('feeling','More connected');assert.equal(called,1);
});

