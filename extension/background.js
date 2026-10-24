import {APP,publicItems} from './core.js';
import {preparedInterests} from './interests.js';
let queue=Promise.resolve();
function serial(fn){const p=queue.then(fn);queue=p.catch(()=>{});return p;}
chrome.sidePanel.setPanelBehavior({openPanelOnActionClick:true}).catch(()=>{});
async function state(){
 const s=await chrome.storage.local.get(['edition','items']);
 if(s.edition!==2){await chrome.storage.local.clear();const next={edition:2,items:preparedInterests()};await chrome.storage.local.set(next);return next;}
 const catalogue=new Map(preparedInterests().map(x=>[x.id,x]));
 return {edition:2,items:(Array.isArray(s.items)?s.items:[]).filter(x=>catalogue.has(x.id)).map(x=>({...catalogue.get(x.id),intent:['me','gift','browsing'].includes(x.intent)?x.intent:'browsing',shared:x.shared===true&&x.intent==='me'}))};
}
chrome.runtime.onInstalled.addListener(()=>serial(state));
chrome.runtime.onMessage.addListener((m,sender,reply)=>{
 const panel=sender.id===chrome.runtime.id&&sender.url===chrome.runtime.getURL('panel.html');
 const app=sender.id===chrome.runtime.id&&sender.frameId===0&&sender.origin===APP;
 if(!panel&&!(app&&m?.type==='read-shared'))return false;
 serial(async()=>{
  const s=await state();
  if(m.type==='read-shared')return {items:publicItems(s.items),version:1};
  if(m.type==='state')return s;
  if(m.type==='update')await chrome.storage.local.set({items:s.items.map(x=>x.id===m.id?{...x,intent:['me','gift','browsing'].includes(m.intent)?m.intent:x.intent,shared:m.shared===true&&m.intent==='me'}:x)});
  else if(m.type==='remove')await chrome.storage.local.set({items:s.items.filter(x=>x.id!==m.id)});
  else if(m.type==='restore')await chrome.storage.local.set({items:preparedInterests()});
  else if(m.type==='forget')await chrome.storage.local.set({items:[]});
  else throw Error('This action is not available.');
  return {ok:true};
 }).then(reply).catch(()=>reply({error:'Your shortlist could not be updated. Please reopen the companion.'}));return true;
});
