import test from 'node:test';
import assert from 'node:assert/strict';
import {aiClient} from '../lib/ai-client.ts';
test('AI requests use Workers-compatible redirect blocking without following credential-bearing requests',async()=>{
 let calls=0;
 const client=aiClient({OPENAI_API_KEY:'test-only'},async(url,init)=>{calls++;assert.equal(url,'https://api.openai.com/v1/responses');assert.equal(init.redirect,'manual');return new Response(null,{status:302,headers:{Location:'https://other.example'}});});
 await assert.rejects(client.response('test'),e=>e.code==='ai_http');assert.equal(calls,1);
});
