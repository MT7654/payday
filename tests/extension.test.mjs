import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const APP='https://payday-reward-discovery.maltoh12345.chatgpt.site';
test('bridge rejects foreign origins, frames, and unknown message types',async()=>{
 let listener;const responses=[],sent=[];const window={top:null,addEventListener:(_,fn)=>listener=fn,postMessage:(m,o)=>responses.push([m,o])};window.top=window;
 vm.runInNewContext(readFileSync(new URL('../extension/bridge.js',import.meta.url),'utf8'),{window,location:{origin:APP},chrome:{runtime:{onMessage:{addListener(){}},sendMessage:async m=>{sent.push(m);return {items:[]};}}}});
 const event={source:window,origin:APP,data:{channel:'payday-request',type:'read-shared',nonce:'123'}};
 await listener({...event,origin:'https://evil.example'});await listener({...event,source:{}});await listener({...event,data:{...event.data,type:'all-history'}});assert.equal(sent.length,0);
 await listener(event);assert.equal(sent.length,1);assert.equal(responses[0][1],APP);assert.equal(responses[0][0].nonce,'123');
});
test('prepared companion never reads browsing data and only shares selected catalogue interests',async()=>{
 let listener;const data={items:[{name:'Private old item',url:'https://private.example'}],sites:['https://private.example']};let cleared=0;
 globalThis.chrome={action:{onClicked:{addListener(){}}},sidePanel:{setPanelBehavior:async()=>{}},runtime:{id:'test-id',getURL:p=>'chrome-extension://test-id/'+p,onInstalled:{addListener(){}},onMessage:{addListener:fn=>listener=fn}},storage:{local:{get:async()=>structuredClone(data),set:async value=>Object.assign(data,value),clear:async()=>{cleared++;for(const k of Object.keys(data))delete data[k];}}}};
 await import('../extension/background.js');
 const panel={id:'test-id',url:'chrome-extension://test-id/panel.html'};
 const app={id:'test-id',origin:APP,frameId:0};
 const call=(m,s)=>new Promise(resolve=>{if(!listener(m,s,resolve))resolve(undefined);});
 const first=await call({type:'state'},panel);assert.equal(cleared,1);assert.equal(first.items.length,4);assert.ok(first.items.every(x=>x.kind==='prepared'&&!x.shared));assert.equal(data.sites,undefined);
 assert.deepEqual((await call({type:'read-shared'},app)).items,[]);
 const id=first.items[0].id;await call({type:'update',id,intent:'me',shared:true},panel);
 const shared=await call({type:'read-shared'},app);assert.equal(shared.items.length,1);assert.equal(shared.items[0].kind,'prepared');
 assert.equal(await call({type:'read-shared'},{id:'test-id',origin:'https://evil.example',frameId:0}),undefined);
 assert.equal(await call({type:'state'},app),undefined);
 assert.equal(await call({type:'capture',item:{name:'Private'}},{id:'test-id',origin:'https://shop.example',frameId:0}),undefined);
 assert.ok((await call({type:'save',item:{name:'Private'}},panel)).error);
 await call({type:'update',id,intent:'gift',shared:true},panel);assert.equal((await call({type:'read-shared'},app)).items.length,0);
 await call({type:'forget'},panel);assert.equal((await call({type:'state'},panel)).items.length,0);
 await call({type:'restore'},panel);assert.equal((await call({type:'state'},panel)).items.length,4);
 delete globalThis.chrome;
});
test('extension limits persistent access to Payday and never observes background browsing',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../extension/manifest.json',import.meta.url),'utf8'));
 assert.deepEqual(manifest.permissions,['storage','sidePanel','activeTab','scripting']);
 assert.equal(manifest.optional_permissions,undefined);assert.equal(manifest.optional_host_permissions,undefined);assert.deepEqual(manifest.host_permissions,[APP+'/*']);
 assert.deepEqual(manifest.content_scripts[0].matches,[APP+'/*']);
 for(const file of ['background.js','panel.js'])assert.doesNotMatch(readFileSync(new URL('../extension/'+file,import.meta.url),'utf8'),/chrome\.(history|webNavigation|webRequest|cookies)/);
});
