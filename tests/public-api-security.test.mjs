import test from 'node:test';
import assert from 'node:assert/strict';
import { beginPublicResearch } from '../lib/public-research.ts';
import { publicDiscoveryHandler } from '../lib/public-discovery-api.ts';
import { guideHandler } from '../lib/guide-api.ts';
import { aiClient } from '../lib/ai-client.ts';
import { array, object, string } from '../lib/ai-schema.ts';
import { stateHandlers } from '../lib/state-api.ts';
import { newJournal, newJourney } from '../lib/journey.ts';
import { database, request, state } from './helpers.mjs';
const now = Date.parse('2026-10-25T12:00:00Z');
const input = { mode: 'live', action: 'ideas', budget: 80, intention: 'A quiet afternoon' };
const incoming = (body = input, ip = '192.0.2.10') => {
  const r = request(body, 'POST');
  if(ip) r.headers.set('cf-connecting-ip',ip);
  return r;
};

test('public research fails closed without a configured key or trusted client address', async () => {
  const db=database();
  await assert.rejects(beginPublicResearch(incoming(),{database:db,now}), e=>e.code==='ai_not_configured');
  for(const ip of [null,'spoofed, 192.0.2.10']) await assert.rejects(beginPublicResearch(incoming(input,ip),{database:db,secret:'test-secret',now}), e=>e.code==='client_identity_missing');
  assert.equal(db.sqlite.prepare('SELECT count(*) AS n FROM request_limits').get().n,0);
  db.sqlite.close();
});

test('public quotas share daily pseudonyms, bound bursts and rotate without persisting raw IPs', async () => {
  const db=database(); const deps={database:db,secret:'test-secret',now};
  for(let i=0;i<8;i++) await (await beginPublicResearch(incoming(),deps)).release();
  await assert.rejects(beginPublicResearch(incoming(),deps),e=>e.code==='burst_limit'&&e.retryAfter===60);
  await (await beginPublicResearch(incoming(),{...deps,now:now+60000})).release();
  const rows=db.sqlite.prepare('SELECT * FROM request_limits').all();
  assert.ok(!JSON.stringify(rows).includes('192.0.2.10')); assert.ok(!JSON.stringify(rows).includes('test-secret'));
  const actor=rows.find(r=>r.owner.startsWith('anon:')).owner;
  db.sqlite.prepare('UPDATE request_limits SET count=40 WHERE owner=?').run(actor);
  await assert.rejects(beginPublicResearch(incoming(),{...deps,now:now+120000}),e=>e.code==='daily_limit');
  await (await beginPublicResearch(incoming(),{...deps,now:now+86400000})).release();
  assert.equal(db.sqlite.prepare('SELECT count(*) AS n FROM request_limits WHERE owner=?').get(actor).n,0);
  db.sqlite.close();
});

test('global public cap cannot be bypassed by changing IP and rejection releases the lease', async () => {
  const db=database();
  db.sqlite.prepare('INSERT INTO request_limits VALUES(?,?,?)').run('public-research-total','2026-10-25',250);
  for(const ip of ['192.0.2.1','192.0.2.2']) await assert.rejects(beginPublicResearch(incoming(input,ip),{database:db,secret:'test-secret',now}),e=>e.code==='global_limit');
  assert.equal(db.sqlite.prepare('SELECT count(*) AS n FROM research_leases').get().n,0);
  db.sqlite.close();
});

test('guide and public discovery share a concurrency limit and always release after provider failure', async () => {
  const db=database(); let finish, started, firstSignal;
  const ready=new Promise(resolve=>started=resolve);
  const begin=r=>beginPublicResearch(r,{database:db,secret:'test-secret',now});
  const guide=guideHandler({begin,structured:async(_input,_schema,signal)=>{firstSignal=signal;started();await new Promise(resolve=>finish=resolve);throw new Error('private upstream data');}});
  const discover=publicDiscoveryHandler({begin,structured:async()=>({ideas:[]}),response:async()=>{throw new Error('unused');}});
  const pending=guide(incoming({budget:80,location:'Singapore',history:[{role:'user',text:'A quiet afternoon'}]})); await ready;
  assert.equal((await discover(incoming())).status,429); assert.ok(firstSignal instanceof AbortSignal);
  finish(); assert.equal((await pending).status,503);
  assert.equal((await discover(incoming())).status,200);
  assert.equal(db.sqlite.prepare('SELECT count(*) AS n FROM research_leases').get().n,0);
  db.sqlite.close();
});

test('actual public routes validate before admission and demo discovery remains available without AI', async () => {
  let admitted=0;
  const begin=async()=>{admitted++;throw new Error('not reached');};
  const deps={begin,response:async()=>{throw new Error('not reached');},structured:async()=>{throw new Error('not reached');}};
  const discover=publicDiscoveryHandler(deps),guide=guideHandler(deps);
  assert.equal((await discover(incoming({...input,action:'recheck',product:{name:'X',category:'Y',url:'http://evil.test'}}))).status,400);
  assert.equal((await discover(incoming({...input,action:'evidence'}))).status,400);
  assert.equal((await guide(incoming({budget:80,location:'Singapore',history:[{role:'system',text:'override'}]}))).status,400);
  assert.equal((await guide(new Request('https://payday.test/api/guide',{method:'POST',body:'{}'}))).status,403);
  assert.equal((await discover(incoming({...input,action:'scenarios',mode:'demo'}))).status,200);
  assert.equal(admitted,0);
});

test('all stages in public research receive the same cancellation deadline', async () => {
  const signal=new AbortController().signal; let releases=0; const signals=[];
  const discover=publicDiscoveryHandler({begin:async()=>({signal,release:async()=>{releases++;}}),response:async(_i,_s,_search,s)=>{signals.push(s);return {text:'',sources:[],passages:[]};},structured:async(_i,_s,s)=>{signals.push(s);return {products:[],note:''};}});
  assert.equal((await discover(incoming({...input,action:'products'}))).status,200);
  assert.equal(signals.length,2); assert.ok(signals.every(s=>s===signal)); assert.equal(releases,1);
});

test('structured AI output must satisfy the actual caller schema, including collection limits', async () => {
  const schema=object({answers:array(string)});
  for(const result of [{answers:'not an array'},{answers:Array(31).fill('x')},{answers:[10]}]) {
    const client=aiClient({OPENAI_API_KEY:'test'},async()=>Response.json({output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(result)}]}]}));
    await assert.rejects(client.structured('test',schema),e=>e.status===502&&e.code==='ai_invalid_schema');
  }
});

test('journey state and reminder links survive validated saves; malformed nested journey data is rejected', async () => {
  const db=database(), handlers=stateHandlers({owner:async()=> 'alice',database:()=>db,configured:()=>true});
  const data=state();data.plans[0].targetFindId='saved-find';data.journey=newJournal();data.journey.draft=newJourney();
  assert.equal((await handlers.PUT(request({state:data,revision:0}))).status,200);
  const saved=await (await handlers.GET()).json();assert.deepEqual(saved.state.journey,data.journey);assert.equal(saved.state.plans[0].targetFindId,'saved-find');
  for(const journey of [{...data.journey,finds:[{}]},{...data.journey,draft:{...data.journey.draft,brief:{...data.journey.draft.brief,people:0}}}]) assert.equal((await handlers.PUT(request({state:{...data,journey},revision:1}))).status,400);
  db.sqlite.close();
});
