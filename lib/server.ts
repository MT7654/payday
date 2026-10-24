import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../app/chatgpt-auth';
export async function owner(){const user=await getChatGPTUser();if(!user)throw new Error('AUTH');return user.userId;}
export function database(){if(!env.DB)throw new Error('Storage is temporarily unavailable.');return env.DB;}
export function runtime(){return env as unknown as Record<string,string>;}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store'}});}
export function failure(e:unknown){const msg=e instanceof Error?(e.name==='ZodError'?'Please check your entries and try again.':e.message):'Unexpected error';return json({error:msg==='AUTH'?'Please sign in to continue.':msg},msg==='AUTH'?401:400);}
export function sameOrigin(r:Request){const origin=r.headers.get('origin');if(origin&&origin!==new URL(r.url).origin)throw new Error('Request origin is not allowed.');}
export async function limitedBody(r:Request){const text=await r.text();if(text.length>400000)throw new Error('This request is too large.');try{return JSON.parse(text);}catch{throw new Error('Invalid request.');}}
