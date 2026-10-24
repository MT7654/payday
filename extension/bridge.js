(() => {
 const origin='https://payday-reward-discovery.maltoh12345.chatgpt.site';
 if(location.origin!==origin||window.top!==window)return;
 chrome.runtime.onMessage.addListener((m,sender,reply)=>{
  if(sender.id!==chrome.runtime.id)return false;
  if(m?.type==='payday-ready'){reply({ready:true});return false;}
  if(m?.type==='identify-product'){
   fetch('/api/identify-product',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(m.payload),signal:AbortSignal.timeout(95000)})
    .then(async r=>{const b=await r.json();reply(r.ok?b:{error:b.error||'AI detection is unavailable. Try again.'});})
    .catch(()=>reply({error:'AI detection could not finish. Check your connection and retry.'}));
   return true;
  }
  if(m?.type!=='save-shortlist')return false;
  // Storage writes are synchronous: acknowledge only after persistence succeeds.
  try{const result=savePaydayShortlist(localStorage,m.items);window.dispatchEvent(new CustomEvent('payday-shortlist-updated'));reply(result);}
  catch{reply({error:'Could not save your shortlist. Check Payday browser storage and try again.'});}
  return false;
 });
 window.addEventListener('message',async e=>{
  if(e.source!==window||e.origin!==origin||e.data?.channel!=='payday-request'||e.data?.type!=='read-shared'||typeof e.data?.nonce!=='string'||e.data.nonce.length>100)return;
  try{const result=await chrome.runtime.sendMessage({type:'read-shared'});window.postMessage({channel:'payday-response',nonce:e.data.nonce,...result},origin);}catch{window.postMessage({channel:'payday-response',nonce:e.data.nonce,error:'Reload this page after updating the extension.'},origin);}
 });
})();
