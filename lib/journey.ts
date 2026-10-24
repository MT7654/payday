import { catalogue } from './catalogue.ts';
import type { Product, Evidence } from './rewards';

export const intentions = [
 {id:'everyday',title:'Enjoy the everyday',description:'A little upgrade to an ordinary day.',icon:'☀',question:'Which part of your day could use an upgrade?',choices:['Mornings','Commute','Desk time','Evenings']},
 {id:'rest',title:'Rest and recharge',description:'Make room for a softer landing.',icon:'☁',question:'Where would you like to unwind?',choices:['Quiet time at home','Getting outside','A pampering experience']},
 {id:'new',title:'Try something new',description:'Follow a small spark of curiosity.',icon:'✳',question:'What kind of first sounds good?',choices:['Make something','Learn something','Go somewhere']},
 {id:'hobby',title:'Enjoy a hobby',description:'More time for something you love.',icon:'✎',question:'What hobby would you like to spend time on?',choices:['Coffee','Reading','Photography','Making things','Music','Gardening']},
 {id:'memory',title:'Make a memory',description:'Something to look forward to.',icon:'↗',question:'Who would you enjoy this with?',choices:['Just me','My partner','Friends','Family']},
 {id:'gift',title:'Treat someone I care about',description:'A little joy, shared.',icon:'♡',question:'What would they appreciate most?',choices:['Something useful','Time together','Something personal']},
 {id:'unsure',title:'Help me figure it out',description:'Start with a possibility, not a product.',icon:'◇',question:'What would feel worthwhile this month?',choices:['Easier weekdays','A better weekend','Something to look forward to']},
] as const;
export type Idea={id:string;title:string;description:string;reason:string;practical:string;minCost:number;maxCost:number;art:string;keywords:string[]};
export type Brief={entry:'discover'|'fit'|'wishlist';budget:number;intention:string;situation:string;details:string;location:string;people:number;exclusions:string;owns:string;effort:string;format:'any'|'own'|'do'|'give';query:string;priority:string;mode:'demo'|'live'};
export type Rejection={id:string;title:string;reason:string};
export type Journey={step:number;brief:Brief;ideas:Idea[];chosen:Idea|null;products:Product[];rejections:Rejection[];startedAt:string};
export type Find=Product & {savedAt:string;brief:Brief;idea?:Idea|null;decision:'saved'|'visited'|'bought'|'skipped';used?:string;satisfaction?:string;feedback?:string;experienceDate?:string;evidence?:Evidence};
export type Wish={id:string;title:string;url:string;price:number|null;addedAt:string};
export type Goal={id:string;title:string;target:number;amount:number};
export type Journal={version:2;draft:Journey|null;finds:Find[];wishes:Wish[];goals:Goal[];usualBudget:number;events:{name:string;at:string;mode:string;session:string;value?:string}[]};
export const newJournal=():Journal=>({version:2,draft:null,finds:[],wishes:[],goals:[],usualBudget:80,events:[]});
export const newJourney=(budget=80):Journey=>({step:1,brief:{entry:'discover',budget,intention:'',situation:'',details:'',location:'Singapore',people:1,exclusions:'',owns:'',effort:'Any',format:'any',query:'',priority:'Best practical fit',mode:'demo'},ideas:[],chosen:null,products:[],rejections:[],startedAt:new Date().toISOString()});
type Recipe=[string,string,string,string,string,string[]];
const recipes:Record<string,Recipe[]>={
 morning:[['Make a morning ritual','Give your first drink of the day a moment of its own.','Use it before work, at your own pace.','Allow a few minutes; some options need beans or refills.','coffee',['coffee','tea','matcha','mug']],['Set a calmer table','Make breakfast feel like a small occasion.','A useful reward you can enjoy every day.','Check care instructions and cupboard space.','pottery',['bowl','pancake','coaster']],['Take your ritual with you','Bring your favourite drink along on busy mornings.','Fits the days when you need to head straight out.','Check capacity, bag fit and cleaning requirements.','bag',['tumbler','bottle']]],
 commute:[['A more peaceful journey','Make space for music or a favourite podcast on the way to work.','A reward that fits into time you already spend travelling.','Check fit and comfort; listen at a safe volume.','headphones',['headphones']],['Travel a little lighter','Give your everyday essentials a comfortable home.','Useful every time you leave the house.','Check dimensions, straps and what you carry.','bag',['bag','backpack','pouch']],['A small pause between places','Turn a waiting moment into a little time for yourself.','An easy ritual with little preparation.','Choose something compact enough to bring along.','journal',['journal','book','tumbler']]],
 desk:[['Make your desk feel yours','Add one thoughtful detail to where you spend your day.','A daily-use reward for your working space.','Check dimensions and existing accessories.','pottery',['desk','coaster','lamp']],['A better break','Step away from the screen for a drink you look forward to.','Creates a small pause within your existing routine.','Some options need ingredients or preparation.','coffee',['tea','coffee','matcha']],['A place for your thoughts','Put ideas and plans onto paper.','A quiet companion for work and life.','Choose paper and a size you enjoy using.','journal',['journal','calligraphy']]],
 home:[['Make an evening ritual','End a busy day with something calming and familiar.','A simple reward for time at home.','Check ingredients, care and recurring costs.','coffee',['tea','mug','candle']],['Make something with your hands','Enjoy a small creative project at your own pace.','A change from scrolling after work.','Allow practice time and a comfortable workspace.','journal',['embroidery','watercolour','calligraphy']],['Make room for a favourite pastime','Settle into an activity you can return to.','Enjoyable on more than just payday.','Check space and time requirements.','gift',['book','game','ukulele']]],
 outside:[['See your city differently','Explore a neighbourhood through a new lens.','A change of scenery without a big trip.','Check weather, travel time and accessibility.','camera',['photography','walk']],['An afternoon with new flavours','Build a little outing around food you have not tried.','A tangible plan to look forward to.','Check dietary needs and what the price includes.','trip',['food','tasting','picnic']],['Get hands-on somewhere new','Try a guided creative session away from your usual routine.','A clear activity with a beginning and an end.','Check dates, duration and material fees.','pottery',['workshop','pottery afternoon']]],
 personal:[['A small everyday keepsake','Make an ordinary object feel personal.','A useful reminder of a person or moment.','Allow production time; check spelling and returns.','gift',['engraved','keyring','watch']],['Keep a favourite chapter','Give meaningful photos or words a home.','Something you can revisit long after payday.','Allow time to choose photos or write a note.','camera',['photo book','journal']],['Share an afternoon','Give your time a little structure with a shared activity.','A reward centred on being together.','Budget for every participant; confirm schedules.','trip',['game','food','workshop']]],
};
export function localIdeas(b:Brief,rejections:Rejection[]=[]):Idea[]{
 const context=`${b.situation} ${b.details} ${b.query}`.toLowerCase();
 const key=/morning|coffee/.test(context)?'morning':/commute/.test(context)?'commute':/desk|weekday/.test(context)?'desk':b.intention==='gift'||/personal/.test(context)?'personal':b.intention==='memory'||/outside|somewhere|weekend|together|forward/.test(context)?'outside':'home';
 const hobby=b.intention==='hobby'?b.situation.toLowerCase():'';
 const hobbyRecipes:Recipe[]=hobby?[[`Make time for ${hobby}`,`Give your next ${hobby} session a small, useful upgrade.`,'Build on something you already enjoy.','Check compatibility with what you own and any ongoing costs.',hobby==='photography'?'camera':hobby==='coffee'?'coffee':'journal',[...hobby==='reading'?['book','journal']:hobby==='making things'?['embroidery','watercolour','calligraphy']:hobby==='music'?['ukulele','headphones']:hobby==='gardening'?['herb','garden']:[hobby]]]]:[];
 const groups=[...hobbyRecipes,...recipes[key],...recipes[key==='outside'?'home':'outside'],...recipes.personal];
 return groups.map((r,i)=>({id:`${key}-${i}`,title:r[0],description:r[1],reason:r[2],practical:r[3],art:r[4],keywords:r[5],minCost:0,maxCost:0})).filter(idea=>!rejections.some(r=>r.title===idea.title)).map(idea=>{
  const matches=localProducts(b,idea);return {...idea,minCost:Math.min(...matches.map(p=>p.price)),maxCost:Math.max(...matches.map(p=>p.price))};
 }).filter(i=>Number.isFinite(i.minCost)).slice(0,3);
}
export function localProducts(b:Brief,idea:Idea|null):Product[]{
 const excluded=`${b.exclusions},${b.owns}`.toLowerCase().split(/[,;\n]/).map(t=>t.trim()).filter(Boolean);
 const keywords=idea?.keywords||b.query.toLowerCase().split(/\W+/).filter(w=>w.length>2&&!['want','something','under','with','that','have','need'].includes(w));
 return catalogue.filter(p=>!excluded.some(t=>`${p.name} ${p.category} ${p.tags.join(" ")} ${p.description}`.toLowerCase().includes(t))).map(p=>{
  const experience=p.category==='Experiences';const price=p.price*(experience?b.people:1);const text=`${p.name} ${p.category} ${p.description}`.toLowerCase();
  const score=keywords.reduce((n,w)=>n+Number(text.includes(w.toLowerCase())),0);
  return {p:{...p,price,reason:idea?`${idea.reason} ${p.reason}`:p.reason,tradeoff:experience?`${p.tradeoff} Illustrative total for ${b.people} ${b.people===1?'person':'people'}.`:p.tradeoff},score,experience};
 }).filter(x=>x.score>0&&x.p.price<=b.budget&&(b.format!=='do'||x.experience)&&(b.format!=='own'||!x.experience))
 .sort((a,b)=>b.score-a.score||a.p.price-b.p.price).slice(0,3).map(x=>x.p);
}
export function canReview(f:Find,today:string){return f.decision==='bought'&&(!f.experienceDate||f.experienceDate<=today);}
export function recordDecision(f:Find,decision:Find['decision']):Find{return {...f,decision:decision==='visited'&&f.decision==='bought'?'bought':decision};}
