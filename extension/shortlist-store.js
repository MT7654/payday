// Runs only in the isolated content-script world on the exact Payday origin.
function savePaydayShortlist(storage,incoming){
 const key='payday-browser-interests-v1';
 if(!Array.isArray(incoming)||!incoming.length||incoming.length>30)throw Error('Invalid shortlist.');
 const cleaned=incoming.map(x=>{
  const u=new URL(x.url);
  if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||u.href.length>1500||typeof x.name!=='string'||!x.name.trim()||x.name.length>180||x.intent!=='me'||!['prepared','saved','viewed','history'].includes(x.kind)||typeof x.seenAt!=='string'||x.seenAt.length>40)throw Error('Invalid interest.');
  return {id:u.href,url:u.href,name:x.name,source:u.hostname,kind:x.kind,intent:'me',seenAt:x.seenAt};
 });
 let old={items:[],ignored:[]};
 const raw=storage.getItem(key);
 if(raw){old=JSON.parse(raw);if(!Array.isArray(old.items)||!Array.isArray(old.ignored))throw Error('Your saved shortlist needs attention in Payday.');}
 const map=new Map(old.items.map(x=>[x.id,x])),saved=[],skipped=[];
 for(const item of cleaned){
  const current=map.get(item.id);
  if(old.ignored.includes(item.id)||(current&&current.intent!=='me')||(!current&&map.size>=100)){skipped.push(item.id);continue;}
  if(!current)map.set(item.id,item);
  saved.push(item.id);
 }
 storage.setItem(key,JSON.stringify({...old,items:[...map.values()]}));
 return {saved,skipped};
}
