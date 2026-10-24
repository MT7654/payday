import {z} from 'zod';
import type {Journal} from './journey';

export const MEMORY_KEY='payday-assistant-memory-v1';
export const DEMO_KEY='payday-assistant-demo-v1';
export const itemSchema=z.object({id:z.string().max(100),name:z.string().min(1).max(180),source:z.string().max(180),status:z.enum(['uncertain','owned','gift','returned']),date:z.string().max(30)});
export const memorySchema=z.object({version:z.literal(1),payday:z.number().int().min(1).max(31),budget:z.number().min(1).max(100000),preference:z.string().max(1000),items:z.array(itemSchema).max(50),learned:z.array(z.string().max(1000)).max(8)});
export type AssistantMemory=z.infer<typeof memorySchema>;
export const emptyMemory=():AssistantMemory=>({version:1,payday:25,budget:80,preference:'',items:[],learned:[]});
export function parseMemory(raw:string|null):AssistantMemory{try{return memorySchema.parse(JSON.parse(raw||'null'));}catch{return emptyMemory();}}
export function nextPayday(day:number,now=new Date()){
 const at=(month:number)=>new Date(now.getFullYear(),month,Math.min(day,new Date(now.getFullYear(),month+1,0).getDate()));
 const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());const thisMonth=at(now.getMonth());return thisMonth>=today?thisMonth:at(now.getMonth()+1);
}
export function personalContext(m:AssistantMemory,j:Journal){
 return [m.preference&&`Explicit preference: ${m.preference}`,...m.learned.map(x=>`Previously confirmed brief: ${x}`),...m.items.map(x=>`${x.name}: ${x.status}. Source: ${x.source}. Receipt alone does not prove ownership or enjoyment.`),...j.finds.filter(f=>f.mode!=='demo').slice(0,12).map(f=>`${f.name}: ${f.decision}; used: ${f.used||'unknown'}; worth it: ${f.satisfaction||'unknown'}; feedback: ${f.feedback||'none'}.`),...j.wishes.slice(0,8).map(w=>`Saved wish, not owned: ${w.title}`)].filter(Boolean).join('\n').slice(0,10000);
}
export const sampleMemory=():AssistantMemory=>({...emptyMemory(),preference:'A screen-free creative break. Little setup, no extra clutter.',items:[{id:'paint',name:'Watercolour paint set',source:'Sample order confirmation · 12 Sep',date:'Sample',status:'uncertain'},{id:'coffee',name:'Pour-over coffee set',source:'Sample confirmed purchase · 18 Aug',date:'Sample',status:'owned'}]});
export type DemoOutcome='enjoyed'|'unused'|'not-worth-it';
export function demoDirection(outcome?:DemoOutcome,ownsPaint=true){
 if(outcome==='unused'||outcome==='not-worth-it')return {title:'A quiet museum afternoon',description:'A creative change of scene, with nothing to set up or store.',why:'Your last creative plan didn’t work out. Try an experience with less preparation.',art:'trip',cost:25,steps:['Choose an exhibition that catches your eye.','Set aside an hour; check opening times before leaving.','Browse at your own pace, with no equipment to bring.']};
 if(!ownsPaint)return {title:'Try a guided sketching session',description:'Explore the creative side without buying a new set of supplies.',why:'You corrected the receipt: those paints aren’t yours. Start with a session that supplies materials.',art:'journal',cost:58,steps:['Check the session includes materials.','Choose a suitable date and location.','Try the activity before buying any equipment.']};
 return {title:'A little painting, a slower afternoon',description:'Put your existing paints to use. Start with one small sketch and your favourite drink.',why:outcome==='enjoyed'?'You enjoyed using what you already had. Make time for another small session.':'You confirmed the paints are yours. Build on them instead of buying another kit.',art:'journal',cost:0,steps:['Use the paints you already own.','Choose a simple object to sketch for 20 minutes.','Check whether you have suitable paper before buying anything.']};
}
