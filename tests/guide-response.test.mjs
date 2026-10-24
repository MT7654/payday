import test from 'node:test';
import assert from 'node:assert/strict';
import {guideHandler} from '../lib/guide-api.ts';
import {extractResearch} from '../lib/research-evidence.ts';

test('malformed guide output is an upstream failure and releases its research lease',async()=>{
 let released=0;
 const handler=guideHandler({
  begin:async()=>({signal:new AbortController().signal,release:async()=>{released++;}}),
  structured:async()=>({message:'Incomplete provider result'}),
 });
 const response=await handler(new Request('https://payday.test/api/guide',{
  method:'POST',headers:{Origin:'https://payday.test','Content-Type':'application/json'},
  body:JSON.stringify({budget:80,location:'Singapore',history:[{role:'user',text:'A quiet evening'}]}),
 }));
 assert.equal(response.status,502);
 assert.equal(released,1);
});

test('citation extraction ignores malformed entries while retaining supported passages',()=>{
 const url='https://merchant.test/products/tea';
 const text='Tea S$20';
 const result=extractResearch({output:[null,3,{content:'not an array'},
  {content:[null,{type:'output_text',text,annotations:[null,{type:'url_citation',url,start_index:0,end_index:text.length}]}],action:{sources:[null,{url}]}}
 ]});
 assert.equal(result.text,text+'\n');
 assert.deepEqual(result.passages,[{url,text}]);
 assert.equal(result.sources.length,1);
});
