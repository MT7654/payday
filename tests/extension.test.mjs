import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const APP='https://payday-reward-discovery.maltoh12345.chatgpt.site';
test('bridge rejects foreign origins, frames, and unknown message types',async()=>{
 let listener;const responses=[],sent=[];const window={top:null,addEventListener:(_,fn)=>listener=fn,postMessage:(m,o)=>responses.push([m,o])};window.top=window;
 vm.runInNewContext(readFileSync(new URL('../extension/bridge.js',import.meta.url),'utf8'),{window,location:{origin:APP},chrome:{runtime:{sendMessage:async m=>{sent.push(m);return {items:[]};}}}});
 const event={source:window,origin:APP,data:{channel:'payday-request',type:'read-shared',nonce:'123'}};
 await listener({...event,origin:'https://evil.example'});await listener({...event,source:{}});await listener({...event,data:{...event.data,type:'all-history'}});assert.equal(sent.length,0);
 await listener(event);assert.equal(sent.length,1);assert.equal(responses[0][1],APP);assert.equal(responses[0][0].nonce,'123');
});
test('service worker limits website access to shared items on the exact app origin',async()=>{
 let listener;const data={items:[],sites:['https://shop.example']};const noop={addListener(){}};
 globalThis.chrome={sidePanel:{setPanelBehavior:async()=>{}},runtime:{id:'test-id',getURL:p=>'chrome-extension://test-id/'+p,onInstalled:noop,onStartup:noop,onMessage:{addListener:fn=>listener=fn}},permissions:{contains:async()=>true,onRemoved:noop,remove:async()=>{}},storage:{local:{get:async()=>structuredClone(data),set:async value=>Object.assign(data,value)}},scripting:{getRegisteredContentScripts:async()=>[],unregisterContentScripts:async()=>{},registerContentScripts:async()=>{}},alarms:{onAlarm:noop,create(){}},notifications:{onClicked:noop},tabs:{}};
 await import('../extension/background.js');
 const panel={id:'test-id',url:'chrome-extension://test-id/panel.html'};
 const call=(m,s)=>new Promise(resolve=>{const accepted=listener(m,s,resolve);if(!accepted)resolve(undefined);});
 await call({type:'save',item:{url:'https://shop.example/products/camera?utm=1',name:'Camera'}},panel);
 const id=data.items[0].id;assert.equal(data.items[0].shared,false);
 await call({type:'update',id,intent:'me',shared:true},panel);
 assert.equal(await call({type:'read-shared'},{id:'test-id',origin:'https://evil.example',frameId:0}),undefined);
 assert.equal(await call({type:'state'},{id:'test-id',origin:APP,frameId:0}),undefined);
 const result=await call({type:'read-shared'},{id:'test-id',origin:APP,frameId:0});assert.equal(result.items.length,1);
 await call({type:'capture',item:{name:'Other',url:'https://shop.example/products/other'}},{id:'test-id',url:'https://shop.example/products/other',tab:{incognito:true},frameId:0});assert.equal(data.items.length,1);
 await call({type:'capture',item:{name:'Unapproved'}},{id:'test-id',url:'https://other.example/products/a',tab:{incognito:false},frameId:0});assert.equal(data.items.length,1);
 await call({type:'update',id,intent:'gift',shared:true},panel);assert.equal((await call({type:'read-shared'},{id:'test-id',origin:APP,frameId:0})).items.length,0);
 delete globalThis.chrome;
});
