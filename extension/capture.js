(() => {
 const products=[];const walk=(x,depth=0)=>{if(!x||depth>6)return;if(Array.isArray(x)){x.slice(0,30).forEach(v=>walk(v,depth+1));return;}if(typeof x!=='object')return;if([x['@type']].flat().includes('Product'))products.push(x);if(x['@graph'])walk(x['@graph'],depth+1);if(x.mainEntity)walk(x.mainEntity,depth+1);};
 for(const el of [...document.querySelectorAll('script[type="application/ld+json"]')].slice(0,15)){if(el.textContent.length>200000)continue;try{walk(JSON.parse(el.textContent));}catch{}}
 const p=products.length===1&&typeof products[0].name==='string'?products[0]:null;
 const og=document.querySelector('meta[property="og:type"]')?.content;
 const name=p?.name||(og==='product'?document.querySelector('meta[property="og:title"]')?.content:'');
 if(!name)return null;
 const item={url:location.href,name:name.slice(0,180),kind:'viewed'};
 chrome.runtime.sendMessage({type:'capture',item}).catch(()=>{});
 return item;
})();
