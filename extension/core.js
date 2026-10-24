export const APP='https://payday-reward-discovery.maltoh12345.chatgpt.site';
export function safeUrl(value){
 try{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||!u.hostname.includes('.')||/^(localhost|127\.|192\.168\.|10\.)/.test(u.hostname))return '';
 if(/(?:^|[/.\-_])(account|login|signin|checkout|cart|payment|bank|health|medical|therapy|adult|inbox|mail|orders|receipt|password)(?:[/.\-_]|$)/i.test(u.hostname+u.pathname))return '';
 u.search='';u.hash='';return u.href.slice(0,1500);}catch{return '';}
}
export function cleanItem(x){const url=safeUrl(x?.url);if(!url||typeof x?.name!=='string'||!x.name.trim())return null;return {id:url,url,name:x.name.trim().slice(0,180),source:new URL(url).hostname,kind:['saved','viewed','history'].includes(x.kind)?x.kind:'saved',intent:['me','gift','browsing'].includes(x.intent)?x.intent:'browsing',shared:x.shared===true,seenAt:new Date().toISOString()};}
export function mergeItem(items,item){const old=items.find(x=>x.id===item.id);return [{...item,...(old?{intent:old.intent,shared:old.shared,kind:old.kind==='saved'?'saved':item.kind}:{} )},...items.filter(x=>x.id!==item.id)].slice(0,100);}
export function publicItems(items){return items.filter(x=>x.shared&&x.intent==='me').slice(0,30).map(({id,url,name,source,kind,intent,seenAt})=>({id,url,name,source,kind,intent,seenAt}));}
