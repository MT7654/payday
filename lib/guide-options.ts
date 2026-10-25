import type {GuideReply} from './guide';
import type {Idea} from './journey';
import {sampleMatches} from './catalogue.ts';
import {matchesExclusion,preferences} from './preferences.ts';

export function keepGuideOptions(previous:GuideReply|null,next:GuideReply,budget:number,answer:string):GuideReply{
 const excluded=preferences(next.brief.avoid.join(', ')).excluded;
 const valid=(idea:Idea)=>Number.isFinite(idea.minCost)&&idea.minCost>=0&&idea.maxCost>=idea.minCost&&idea.maxCost<=budget&&!matchesExclusion([idea.title,idea.description,...idea.keywords].join(' '),excluded);
 const incoming=next.ideas.filter(valid);
 if(incoming.length)return {...next,ideas:incoming};
 const changedDirection=/something different|start over|none of these|another direction|don[’']t want|do not want|wouldn[’']t use/i.test(answer)||next.brief.format!==previous?.brief.format;
 const retained=changedDirection?[]:(previous?.ideas||[]).filter(valid);
 if(retained.length)return {...next,ideas:retained};
 const direction=[next.brief.goal,...next.brief.keep,next.brief.priority,answer].join(' ');
 const samples=sampleMatches(budget,direction,next.brief.avoid.join(', ')).filter(p=>next.brief.format==='do'?p.category==='Experiences':next.brief.format==='own'?p.category!=='Experiences':true);
 const ideas:Idea[]=samples.slice(0,2).map(p=>({id:'constructed-'+p.id,title:p.name,description:p.description,reason:'A provisional option to react to while we refine your brief.',practical:'Illustrative concept. '+p.tradeoff,minCost:p.price,maxCost:p.price,art:p.art,keywords:p.tags}));
 if(!ideas.length)ideas.push({id:'constructed-keep-exploring',title:'Explore another direction',description:'Keep your budget and tell us what would appeal instead.',reason:'No current concept fits all your requirements.',practical:'No purchase or charge. Your preferences stay saved.',minCost:0,maxCost:0,art:'gift',keywords:[]});
 return {...next,ideas};
}
