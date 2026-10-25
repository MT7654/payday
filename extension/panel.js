const $=id=>document.getElementById(id);
const message=async data=>{const r=await chrome.runtime.sendMessage(data);if(r?.error)throw Error(r.error);return r;};
const tell=text=>$('status').textContent=text;
const confirmed=new Set();let busy=false,draft=null;
function element(tag,text){const e=document.createElement(tag);if(text)e.textContent=text;return e;}
async function change(fn){if(busy)return;busy=true;try{await render();await fn();}catch(e){tell(e.message);}finally{busy=false;try{await render();}catch{tell('Reload the extension and reopen the companion.');}}}
async function send(ids){tell('Saving to your Payday shortlist…');const r=await message({type:'send-shortlist',ids});for(const id of r.saved)confirmed.add(id);tell(r.skipped.length?'Some items were excluded or previously removed in Payday. Review those there; other items are saved.':`${r.saved.length===1?'Added to your shortlist.':r.saved.length+' items added to your shortlist.'} Ready whenever you visit Payday.`);}
async function saveDraft(){const item={...draft,name:$('product-name').value.trim()};if(!item.name)throw Error('Give this product a name first.');const r=await message({type:'save-captured',item});draft=null;$('review').hidden=true;await send([r.id]);}
async function render(){const s=await message({type:'state'});$('count').textContent=s.items.length;$('items').replaceChildren();let available=0;
 $('capture').disabled=busy;$('confirm').disabled=busy;
 if(!s.items.length){const box=element('section');box.className='empty';box.append(element('h2','A little room for possibility.'),element('p','Open a product you like, then add it here.'));$('items').append(box);}
 for(const x of s.items){const card=element('article');card.className='interest';const top=element('div');top.className='interest-top';const symbol=element('span',x.symbol||'↗');symbol.className='symbol '+(x.slug||'');symbol.setAttribute('aria-hidden','true');const copy=element('div');copy.append(element('small',x.category||x.source),element('h3',x.name));top.append(symbol,copy);card.append(top,element('p',x.note||'Saved from a product page. An interest, not a purchase.'));
 const controls=element('div');controls.className='controls';const select=element('select');select.disabled=busy;select.setAttribute('aria-label','Intent for '+x.name);for(const [value,label]of [['me','For me'],['gift','A gift'],['browsing','Just exploring']]){const opt=element('option',label);opt.value=value;select.append(opt);}select.value=x.intent;
 select.onchange=()=>change(async()=>{confirmed.delete(x.id);await message({type:'update',id:x.id,intent:select.value,shared:false});});
 const remove=element('button','×');remove.className='remove';remove.disabled=busy;remove.setAttribute('aria-label','Remove '+x.name);remove.onclick=()=>change(()=>message({type:'remove',id:x.id}));controls.append(select,remove);card.append(controls);
 const add=element('button',confirmed.has(x.id)?'✓ Added to shortlist':x.shared?'Send to shortlist again':'Add to shortlist');add.className='add-item';add.disabled=busy||x.intent!=='me'||confirmed.has(x.id);add.onclick=()=>change(()=>send([x.id]));card.append(add);if(x.intent==='me'&&!confirmed.has(x.id))available++;$('items').append(card);}
 $('send-all').disabled=busy||!available;$('sharing').textContent='Saved directly to Payday in this Chrome profile. No import step.';
}
$('capture').onclick=()=>change(async()=>{tell('Looking at this product with AI…');const r=await message({type:'capture-current'});draft={...r.item,name:r.products[0].name};$('product-name').value=draft.name;$('choices').replaceChildren();$('review').hidden=false;if(r.products.length===1&&r.products[0].confidence==='high')await saveDraft();else{for(const product of r.products){const choice=element('button',product.name);choice.className='secondary';choice.onclick=()=>{$('product-name').value=product.name;};$('choices').append(choice);}tell(r.message||'Choose or edit the product name, then add it.');}});
$('confirm').onclick=()=>change(saveDraft);
$('cancel').onclick=()=>{draft=null;$('review').hidden=true;};
$('send-all').onclick=()=>change(async()=>{const s=await message({type:'state'});await send(s.items.filter(x=>x.intent==='me'&&!confirmed.has(x.id)).map(x=>x.id));});
$('restore').onclick=()=>change(async()=>{await message({type:'restore'});confirmed.clear();tell('Your starting interests are ready.');});
$('forget').onclick=()=>{if(confirm('Clear extension interests? Your saved Payday shortlist stays.'))change(async()=>{await message({type:'forget'});confirmed.clear();tell('Extension interests cleared.');});};
render().catch(e=>tell(e.message));
