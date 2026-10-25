import {z} from 'zod';
export const guideSchema=z.object({opening:z.boolean().default(false),budget:z.number().min(1).max(100000),location:z.string().min(1).max(150),context:z.string().max(10000).default(''),history:z.array(z.object({role:z.enum(['user','assistant']),text:z.string().min(1).max(6000)})).min(1).max(24)});
export type GuideBrief={goal:string;keep:string[];avoid:string[];priority:string;occasion:string;format:'any'|'own'|'do'|'give'};
export type GuideReply={message:string;question:string;answers:string[];brief:GuideBrief;ideas:import('./journey').Idea[]};
export function transcript(history:{role:string;text:string}[]){return history.map(h=>`${h.role==='user'?'BUYER':'GUIDE'}: ${h.text}`).join('\n');}

export const guideReplySchema=z.object({
 message:z.string().max(420),question:z.string().max(180),answers:z.array(z.string()),
 brief:z.object({goal:z.string(),keep:z.array(z.string()),avoid:z.array(z.string()),priority:z.string(),occasion:z.string(),format:z.enum(['any','own','do','give'])}),
 ideas:z.array(z.object({title:z.string(),description:z.string(),reason:z.string(),practical:z.string(),minCost:z.number(),maxCost:z.number(),art:z.string(),keywords:z.array(z.string())})),
});
