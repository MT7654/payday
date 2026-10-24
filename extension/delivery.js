import {APP} from './core.js';
export async function requestPayday(message,tabs=chrome.tabs,pause=ms=>new Promise(r=>setTimeout(r,ms))){
 const existing=await tabs.query({url:APP+'/*'});let temporary;
 async function ready(id){try{return (await tabs.sendMessage(id,{type:'payday-ready'},{frameId:0}))?.ready===true;}catch{return false;}}
 async function send(id){const result=await tabs.sendMessage(id,message,{frameId:0});if(result?.error)throw Error(result.error);if(!result)throw Error('Payday did not respond.');return result;}
 for(const tab of existing)if(await ready(tab.id))return send(tab.id);
 try{temporary=await tabs.create({url:APP+'/?companion=save',active:false});for(let i=0;i<30;i++){if(await ready(temporary.id))return await send(temporary.id);await pause(400);}throw Error('Could not connect to Payday. Check your connection and retry.');}
 finally{if(temporary?.id!==undefined)await tabs.remove(temporary.id).catch(()=>{});}
}
export async function deliverShortlist(items,tabs,pause){if(!items.length)throw Error('Choose an interest for yourself first.');const result=await requestPayday({type:'save-shortlist',items},tabs,pause);if(!Array.isArray(result.saved)||!Array.isArray(result.skipped))throw Error('Payday did not confirm the save.');return result;}
