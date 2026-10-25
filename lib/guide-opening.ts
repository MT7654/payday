import type {GuideReply} from './guide';
export type DiscoveryInterest={name:string;url:string;intent:'me'|'gift'|'browsing'};
export type DiscoverySummary={stage:'week'|'feeling'|'themes';total:number;matched:number;categories:{label:string;count:number;theme:string}[]};
// One vote per unique product URL. Fixed category order breaks equal-count ties;
// insertion order and repeated captures cannot push a theme to the front.
const categories=[
 {label:'Audio',pattern:/\b(headphones?|earbuds?|earphones?|airpods?|speakers?|music|turntable|soundbar)\b/i,themes:['Music and listening','A little quiet']},
 {label:'Creativity',pattern:/\b(camera|paints?|painting|sketch|craft|pottery|journal|drawing|watercolou?r|sewing|guitar|piano)\b/i,themes:['A creative break','Learning something new']},
 {label:'Food and drink',pattern:/\b(coffee|tea|cook|cooking|cookware|kitchen|espresso|kettle|baking|airfryer)\b/i,themes:['Better everyday rituals','Trying new flavours']},
 {label:'Travel and outdoors',pattern:/\b(travel|trip|luggage|backpack|hiking|camping|tent|suitcase)\b/i,themes:['A change of scene','Time outdoors']},
 {label:'Movement',pattern:/\b(running|fitness|yoga|gym|bicycle|bike|dumbbell|exercise|pilates)\b/i,themes:['More movement','Fresh energy']},
 {label:'Personal projects',pattern:/\b(laptop|macbook|computer|keyboard|monitor|tablet|ipad|mac mini)\b/i,themes:['Time for a personal project','Learning something new']},
 {label:'Style',pattern:/\b(shoes?|clothes|watch|bag|jewellery|jewelry|dress|shirt|sneakers?|perfume)\b/i,themes:['Expressing my style','A fresh everyday look']},
 {label:'Home comfort',pattern:/\b(blanket|pillow|cushion|lamp|candle|bedding|duvet|sofa)\b/i,themes:['A cosier space','Time to unwind']},
 {label:'Play',pattern:/\b(game|gaming|console|playstation|xbox|puzzle|lego)\b/i,themes:['A little play','Time with friends']},
];
export function legacyInterests(context:string):DiscoveryInterest[]{
 const items:DiscoveryInterest[]=[];
 for(const match of context.matchAll(/Interest context, NOT ownership or a confirmed need: (\{[^\n]+?\})\./g)){
  try{const x=JSON.parse(match[1]);if(typeof x.name==='string'&&typeof x.url==='string')items.push({name:x.name,url:x.url,intent:'me'});}catch{}
 }return items;
}
export function summarizeInterests(items:DiscoveryInterest[]):DiscoverySummary{
 const seen=new Set<string>(),counts=new Map<string,number>();let total=0,matched=0;
 for(const item of items){
  if(item.intent!=='me')continue;
  let key:string;try{const u=new URL(item.url);if(u.protocol!=='https:')continue;key=u.origin+u.pathname.replace(/\/+$/,'');}catch{continue;}
  if(seen.has(key))continue;seen.add(key);total++;
  const category=categories.find(c=>c.pattern.test(item.name));
  if(category){matched++;counts.set(category.label,(counts.get(category.label)||0)+1);}
 }
 const ranked=categories.map(c=>({label:c.label,count:counts.get(c.label)||0,theme:c.themes[0]})).filter(c=>c.count>0).sort((a,b)=>b.count-a.count);
 return {stage:ranked.length?'themes':'week',total,matched,categories:ranked};
}
const emptyBrief=()=>({goal:'',keep:[],avoid:[],priority:'',occasion:'',format:'any' as const});
export function guideOpening(context:string,items?:DiscoveryInterest[]):GuideReply {
 const discovery=summarizeInterests(items??legacyInterests(context));
 if(!discovery.categories.length)return {message:discovery.total?'Let’s start with your week.':'No shortlist needed. Let’s start with you.',question:'How has this week felt overall?',answers:['Draining','Restless','Pretty good'],brief:emptyBrief(),ideas:[],discovery};
 const top=discovery.categories.slice(0,2);
 const themes=top.map(c=>c.theme);
 if(top.length===1)themes.push(categories.find(c=>c.label===top[0].label)!.themes[1]);
 return {message:'A few themes to explore.',question:'Which direction appeals to you today?',answers:[...themes,'Something different'],brief:emptyBrief(),ideas:[],discovery};
}
export function feelingFollowup():GuideReply{
 return {message:'Let’s shape a moment around that.',question:'How would you like the next few days to feel?',answers:['Calmer','More energised','More connected'],brief:emptyBrief(),ideas:[],discovery:{stage:'feeling',total:0,matched:0,categories:[]}};
}
