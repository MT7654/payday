// Executed on demand in the active tab after a user gesture; no observers.
export function readCurrentProduct(){
 const visible=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&getComputedStyle(e).visibility!=='hidden';};
 const headings=[...document.querySelectorAll('h1')].filter(visible).map(e=>e.innerText.trim()).filter(Boolean);
 const products=[];
 function visit(x,depth=0){if(!x||depth>8)return;if(Array.isArray(x)){x.slice(0,50).forEach(v=>visit(v,depth+1));return;}if(typeof x!=='object')return;const type=x['@type'];if(type==='Product'||Array.isArray(type)&&type.includes('Product'))products.push(x);if(x['@graph'])visit(x['@graph'],depth+1);if(x.mainEntity)visit(x.mainEntity,depth+1);}
 for(const script of [...document.querySelectorAll('script[type="application/ld+json"]')].slice(0,20)){if(script.textContent.length>200000)continue;try{visit(JSON.parse(script.textContent));}catch{}}
 const names=[...new Set(products.map(x=>typeof x.name==='string'?x.name.trim():'').filter(Boolean))];
 const heading=headings.length===1?headings[0]:'';
 const matching=names.find(n=>heading&&(heading.toLowerCase().includes(n.toLowerCase())||n.toLowerCase().includes(heading.toLowerCase())));
 const og=document.querySelector('meta[property="og:title"]')?.content;
 const name=matching||(names.length===1?names[0]:heading)||og||document.title;
 const productType=document.querySelector('meta[property="og:type"]')?.content==='product';
 return {name:String(name||'').trim().slice(0,180),url:location.href,confident:!!matching||(names.length===1&&headings.length<=1)||(!!heading&&productType)};
}
