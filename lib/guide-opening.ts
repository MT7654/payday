import type {GuideReply} from './guide';

// Only deliberate discovery starts use this opener. A typed product question
// still goes straight to the guide. Saved items suggest themes, never needs.
export function guideOpening(context:string):GuideReply {
 const names:string[]=[];
 for(const match of context.matchAll(/Interest context, NOT ownership or a confirmed need: (\{[^\n]+?\})\./g)){
  try{const item=JSON.parse(match[1]);if(typeof item.name==='string')names.push(item.name);}catch{}
 }
 const themes=new Set<string>();
 for(const name of names){
  if(/headphone|earbud|speaker|music|turntable/i.test(name)){themes.add('Music and podcasts');themes.add('A little quiet');}
  else if(/camera|paint|sketch|craft|pottery|journal/i.test(name))themes.add('A creative break');
  else if(/coffee|tea\b|cook|kitchen/i.test(name))themes.add('Better everyday rituals');
  else if(/travel|trip|luggage|backpack|hiking/i.test(name))themes.add('A change of scene');
  else if(/laptop|macbook|computer|keyboard|monitor/i.test(name))themes.add('Time for a personal project');
  else if(/shoe|clothes|watch|bag|jewellery/i.test(name))themes.add('Expressing my style');
 }
 return {message:'Let’s start with what you’d enjoy.',question:'What would you like more of?',answers:themes.size?[...themes].slice(0,2).concat('Something different'):['Time to unwind','Something new to try','A better daily routine'],brief:{goal:'',keep:[],avoid:[],priority:'',occasion:'',format:'any'},ideas:[]};
}
