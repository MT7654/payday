import {emptyState,type State,type Plan} from './rewards.ts';
const key='payday-guest-state-v1';
type Storage=Pick<globalThis.Storage,'getItem'|'setItem'>;
export function loadGuestState(storage:Storage):State{
 const fresh=()=>structuredClone(emptyState);
 const raw=storage.getItem(key);if(!raw)return fresh();
 try{const value=JSON.parse(raw);if(value.version!==1||!value.state)return fresh();const s=value.state;
 if(!['plans','sessions','saved','events'].every(k=>Array.isArray(s[k]))||!s.settings)return fresh();
 s.plans=s.plans.filter((p:Plan)=>p&&typeof p.id==='string'&&typeof p.title==='string'&&typeof p.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(p.date)&&typeof p.time==='string'&&Number.isFinite(p.budget)&&p.budget>0&&Array.isArray(p.notified)&&Array.isArray(p.dismissed)&&typeof p.timezone==='string'&&(()=>{try{new Intl.DateTimeFormat('en',{timeZone:p.timezone});return true;}catch{return false;}})());
 return {...fresh(),...s,settings:{...emptyState.settings,...s.settings,mode:s.settings.mode==='live'?'live':'demo'}};
 }catch{return fresh();}
}
export function saveGuestState(storage:Storage,state:State){storage.setItem(key,JSON.stringify({version:1,state:{...state,settings:{...state.settings,mode:state.settings.mode}}}));}
