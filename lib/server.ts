import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../app/chatgpt-auth';
export async function owner(){const user=await getChatGPTUser();if(!user)throw new Error('AUTH');return user.userId;}
export function database(){if(!env.DB)throw new Error('Storage is temporarily unavailable.');return env.DB;}
export function runtime(){return env as unknown as Record<string,string>;}
export { json, failure, sameOrigin, limitedBody, HttpError } from './http';
