(() => {
 const origin='https://payday-reward-discovery.maltoh12345.chatgpt.site';
 if(location.origin!==origin||window.top!==window)return;
 window.addEventListener('message',async e=>{
  if(e.source!==window||e.origin!==origin||e.data?.channel!=='payday-request'||e.data?.type!=='read-shared'||typeof e.data?.nonce!=='string'||e.data.nonce.length>100)return;
  try{const result=await chrome.runtime.sendMessage({type:'read-shared'});window.postMessage({channel:'payday-response',nonce:e.data.nonce,...result},origin);}catch{window.postMessage({channel:'payday-response',nonce:e.data.nonce,error:'Reload this page after updating the extension.'},origin);}
 });
})();
