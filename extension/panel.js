const $=id=>document.getElementById(id);
const message=async data=>{const r=await chrome.runtime.sendMessage(data);if(r?.error)throw Error(r.error);return r;};
const tell=text=>$('status').textContent=text;
function element(tag,text){const e=document.createElement(tag);if(text)e.textContent=text;return e;}
async function change(fn){try{await fn();await render();}catch(e){tell(e.message);}}
async function render(){const s=await message({type:'state'});$('count').textContent=s.items.length;$('items').replaceChildren();let shared=0;
 if(!s.items.length){const box=element('section');box.className='empty';box.append(element('h2','A little room for possibility.'),element('p','Restore your starting interests in About, or discover something fresh in Payday.'));$('items').append(box);}
 for(const x of s.items){const card=element('article');card.className='interest';const top=element('div');top.className='interest-top';const symbol=element('span',x.symbol);symbol.className='symbol '+x.slug;symbol.setAttribute('aria-hidden','true');const copy=element('div');copy.append(element('small',x.category),element('h3',x.name));top.append(symbol,copy);card.append(top,element('p',x.note));
 const controls=element('div');controls.className='controls';const select=element('select');select.setAttribute('aria-label','Intent for '+x.name);for(const [value,label]of [['me','For me'],['gift','A gift'],['browsing','Just exploring']]){const opt=element('option',label);opt.value=value;select.append(opt);}select.value=x.intent;
 const label=element('label'),checkbox=element('input');checkbox.type='checkbox';checkbox.checked=x.shared&&x.intent==='me';checkbox.disabled=x.intent!=='me';if(checkbox.checked)shared++;label.append(checkbox,document.createTextNode('Share'));
 const update=()=>change(()=>message({type:'update',id:x.id,intent:select.value,shared:select.value==='me'&&checkbox.checked}));select.onchange=update;checkbox.onchange=update;
 const remove=element('button','×');remove.className='remove';remove.setAttribute('aria-label','Remove '+x.name);remove.onclick=()=>change(()=>message({type:'remove',id:x.id}));controls.append(select,label,remove);card.append(controls);$('items').append(card);}
 $('sharing').textContent=shared?shared+(shared===1?' interest ready.':' interests ready.')+' In Payday, choose “Bring in my shortlist”.':'Choose Share on the interests you want Payday to consider.';
}
$('restore').onclick=()=>change(async()=>{await message({type:'restore'});tell('Your starting interests are ready.');});
$('forget').onclick=()=>{if(confirm('Clear this shortlist? You can restore the starting interests later.'))change(async()=>{await message({type:'forget'});tell('Shortlist cleared.');});};
render().catch(e=>tell(e.message));
