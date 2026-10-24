import {APP,cleanItem,mergeItem,publicItems,safeUrl} from './core.js';
let queue=Promise.resolve();
function serial(fn){const p=queue.then(fn);queue=p.catch(()=>{});return p;}
chrome.sidePanel.setPanelBehavior({openPanelOnActionClick:true}).catch(()=>{});
async function state(){const s=await chrome.storage.local.get(['items','sites','day','lastReminder']);return {items:[],sites:[],day:25,...s};}
async function registers(){const s=await state();const all=await chrome.scripting.getRegisteredContentScripts();if(all.length)await chrome.scripting.unregisterContentScripts({ids:all.map(x=>x.id)});for(const [i,site] of s.sites.entries()){if(await chrome.permissions.contains({origins:[site+'/*']}))await chrome.scripting.registerContentScripts([{id:'shop-'+i,matches:[site+'/*'],js:['capture.js'],runAt:'document_idle'}]);}}
chrome.runtime.onInstalled.addListener(()=>{chrome.alarms.create('payday',{periodInMinutes:60});registers().catch(()=>{});});
chrome.runtime.onStartup.addListener(()=>{registers().catch(()=>{});});
chrome.permissions.onRemoved.addListener(()=>registers().catch(()=>{}));
chrome.runtime.onMessage.addListener((m,sender,reply)=>{
 const panel=sender.id===chrome.runtime.id&&sender.url===chrome.runtime.getURL('panel.html');
 const app=sender.id===chrome.runtime.id&&sender.frameId===0&&sender.origin===APP;
 if(m?.type==='read-shared'&&app){state().then(s=>reply({items:publicItems(s.items),version:1}));return true;}
 if(m?.type==='capture'&&sender.tab&&!sender.tab.incognito&&sender.frameId===0){serial(async()=>{const s=await state();const url=safeUrl(sender.url);if(!url||!s.sites.includes(new URL(url).origin))return;const item=cleanItem({...m.item,url:sender.url,kind:'viewed',shared:false,intent:'browsing'});if(item)await chrome.storage.local.set({items:mergeItem(s.items,item)});}).then(()=>reply({ok:true}));return true;}
 if(!panel)return false;
 serial(async()=>{
  const s=await state();
  if(m.type==='state')return s;
  if(m.type==='save'){const item=cleanItem({...m.item,kind:'saved',intent:'me',shared:false});if(!item)throw Error('Open a public product page first. Private and checkout pages cannot be saved.');await chrome.storage.local.set({items:mergeItem(s.items,item)});}
  if(m.type==='update'){await chrome.storage.local.set({items:s.items.map(x=>x.id===m.id?{...x,intent:['me','gift','browsing'].includes(m.intent)?m.intent:x.intent,shared:m.shared===true}:x)});}
  if(m.type==='remove')await chrome.storage.local.set({items:s.items.filter(x=>x.id!==m.id)});
  if(m.type==='forget')await chrome.storage.local.set({items:[]});
  if(m.type==='site'){const url=safeUrl(m.origin);if(!url)throw Error('This site cannot be watched.');const origin=new URL(url).origin;if(m.enabled&&!await chrome.permissions.contains({origins:[origin+'/*']}))throw Error('Site permission is needed.');await chrome.storage.local.set({sites:m.enabled?[...new Set([...s.sites,origin])].slice(0,20):s.sites.filter(x=>x!==origin)});await registers();}
  if(m.type==='history'){if(!await chrome.permissions.contains({permissions:['history']}))throw Error('History permission was not granted.');try{const entries=await chrome.history.search({text:'',startTime:Date.now()-7*86400000,maxResults:200});const candidates=entries.filter(x=>{const u=safeUrl(x.url);return u&&s.sites.includes(new URL(u).origin)&&x.title&&/(\/products?\/|\/dp\/|\/item\/|\/p\/)/i.test(u);});return {candidates:candidates.slice(0,30).map(x=>cleanItem({url:x.url,name:x.title,kind:'history'})).filter(Boolean)};}finally{await chrome.permissions.remove({permissions:['history']});}}
  if(m.type==='import'){let items=s.items;for(const x of (Array.isArray(m.items)?m.items:[]).slice(0,30)){const item=cleanItem({...x,kind:'history',intent:'browsing',shared:false});if(item)items=mergeItem(items,item);}await chrome.storage.local.set({items});}
  if(m.type==='day'){const day=Number(m.day);if(Number.isInteger(day)&&day>=1&&day<=31)await chrome.storage.local.set({day});}
  return {ok:true};
 }).then(reply).catch(e=>reply({error:e.message}));return true;
});
chrome.alarms.onAlarm.addListener(async a=>{if(a.name!=='payday'||!await chrome.permissions.contains({permissions:['notifications']}))return;const s=await state(),now=new Date(),key=now.getFullYear()+'-'+now.getMonth(),day=Math.min(s.day,new Date(now.getFullYear(),now.getMonth()+1,0).getDate());if(now.getDate()!==day||s.lastReminder===key)return;await chrome.notifications.create('payday',{type:'basic',iconUrl:'icon.png',title:'A little something, with you in mind',message:'Your payday shortlist is ready to explore. Choose a comfortable budget in Payday.'});await chrome.storage.local.set({lastReminder:key});});
chrome.notifications.onClicked.addListener(id=>{if(id==='payday')chrome.tabs.create({url:APP});});
