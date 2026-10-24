import {z} from 'zod';
export const guideSchema=z.object({budget:z.number().min(1).max(100000),location:z.string().min(1).max(150),history:z.array(z.object({role:z.enum(['user','assistant']),text:z.string().min(1).max(6000)})).min(1).max(24)});
export type GuideBrief={goal:string;keep:string[];avoid:string[];priority:string;occasion:string;format:'any'|'own'|'do'|'give'};
export type GuideReply={message:string;question:string;answers:string[];brief:GuideBrief;ideas:import('./journey').Idea[]};
export function transcript(history:{role:string;text:string}[]){return history.map(h=>`${h.role==='user'?'BUYER':'GUIDE'}: ${h.text}`).join('\n');}
