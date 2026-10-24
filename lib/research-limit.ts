import {database,runtime} from './server';
// Anonymous limits use a keyed, daily IP digest. Never persist raw IP addresses.
export async function researchLimit(r:Request){
 const day=new Date().toISOString().slice(0,10),minute=new Date().toISOString().slice(0,16);
 const ip=r.headers.get('cf-connecting-ip')||'local-preview';
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`${runtime().OPENAI_API_KEY}:${day}:${ip}`));
 const id=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
 for(const [key,window,limit] of [[`anon:${id}`,day,40],[`burst:${id}`,minute,8],['public-research-total',day,250]] as const){
 const result=await database().prepare('INSERT INTO request_limits(owner,day,count) VALUES(?,?,1) ON CONFLICT(owner) DO UPDATE SET day=excluded.day,count=CASE WHEN request_limits.day=excluded.day THEN request_limits.count+1 ELSE 1 END WHERE request_limits.day<>excluded.day OR request_limits.count<?').bind(key,window,limit).run();
 if(!result.meta.changes)return false;
 }
 return true;
}
