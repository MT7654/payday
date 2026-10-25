import {APP,publicItems,cleanItem,mergeItem,safeUrl} from './core.js';
import {preparedInterests} from './interests.js';
import {deliverShortlist,requestPayday} from './delivery.js';
import {readCurrentProduct} from './capture.js';
let queue=Promise.resolve();
function serial(fn){const p=queue.then(fn);queue=p.catch(()=>{});return p;}
// A real action click grants activeTab. Auto-opening the panel alone can leave
// a panel with no grant for a newly selected page.
chrome.sidePanel.setPanelBehavior({openPanelOnActionClick:false}).catch(()=>{});
chrome.action.onClicked.addListener(tab=>{
 // Keep this call directly in the gesture handler (before any await).
 chrome.sidePanel.open({windowId:tab.windowId}).catch(()=>{});
});
async function state(){
 const s=await chrome.storage.local.get(['edition','items']);
 if(s.edition!==2){await chrome.storage.local.clear();const next={edition:2,items:preparedInterests()};await chrome.storage.local.set(next);return next;}
 const catalogue=new Map(preparedInterests().map(x=>[x.id,x]));
 return {edition:2,items:(Array.isArray(s.items)?s.items:[]).slice(0,100).map(x=>catalogue.has(x.id)?{...catalogue.get(x.id),intent:['me','gift','browsing'].includes(x.intent)?x.intent:'browsing',shared:x.shared===true&&x.intent==='me'}:cleanItem({...x,kind:'saved'})).filter(Boolean)};
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
  if(m.type==='capture-current'){
   const [tab]=await chrome.tabs.query({active:true,lastFocusedWindow:true});
   if(tab?.id===undefined)throw Error('No active browser tab found. Open a product page and try again.');
   // Read the page through the activeTab grant, rather than assuming query()
   // exposes tab.url while a side panel has focus.
   let results;
   try{results=await chrome.scripting.executeScript({target:{tabId:tab.id},func:readCurrentProduct});}
   catch{throw Error('Page access is not granted yet. Click the Payday icon in Chrome’s toolbar on this product tab, then Detect & add. After an extension update, reload it in chrome://extensions first.');}
   const product=results[0]?.result;
   const pageUrl=safeUrl(product?.url);
   if(!pageUrl||new URL(pageUrl).origin===APP)throw Error('Choose a public HTTPS product page, rather than Payday, a sign-in page or checkout.');
   const image=await chrome.tabs.captureVisibleTab(tab.windowId,{format:'jpeg',quality:60});
   const [stillActive]=await chrome.tabs.query({active:true,lastFocusedWindow:true});
   if(stillActive?.id!==tab.id||(stillActive.url&&safeUrl(stillActive.url)!==pageUrl))throw Error('The page changed. Please try again on the product page.');
   const item=cleanItem({...product,kind:'saved',intent:'me',shared:false});
   if(!item)throw Error('This page could not be saved. Try a public product page.');
   const detected=await requestPayday({type:'identify-product',payload:{image,name:item.name,url:item.url}});
   if(!Array.isArray(detected.products)||!detected.products.length)throw Error(detected.message||'No clear product found. Open a product page and try again.');
   return {item,products:detected.products,message:detected.message};
  }
  if(m.type==='save-captured'){
   const item=cleanItem({...m.item,kind:'saved',intent:'me',shared:false});
   if(!item||new URL(item.url).origin===APP)throw Error('Choose a valid product page.');
   await chrome.storage.local.set({items:mergeItem(s.items,item)});
   return {id:item.id};
  }
  if(m.type==='send-shortlist'){
   const selected=s.items.filter(x=>Array.isArray(m.ids)&&m.ids.includes(x.id)&&x.intent==='me');
   const result=await deliverShortlist(publicItems(selected.map(x=>({...x,shared:true}))));
   await chrome.storage.local.set({items:s.items.map(x=>result.saved.includes(x.id)?{...x,shared:true}:x)});
   return result;
  }
  if(m.type==='update')await chrome.storage.local.set({items:s.items.map(x=>x.id===m.id?{...x,intent:['me','gift','browsing'].includes(m.intent)?m.intent:x.intent,shared:m.shared===true&&m.intent==='me'}:x)});
  else if(m.type==='remove')await chrome.storage.local.set({items:s.items.filter(x=>x.id!==m.id)});
  else if(m.type==='restore')await chrome.storage.local.set({items:preparedInterests()});
  else if(m.type==='forget')await chrome.storage.local.set({items:[]});
  else throw Error('This action is not available.');
  return {ok:true};
 }).then(reply).catch(e=>reply({error:e?.message||'Your shortlist could not be updated. Please reopen the companion.'}));return true;
});
