import {requestTimeout} from './browser-compat';
export const isBeta=import.meta.env.VITE_SITE_CHANNEL==='beta';
export async function betaRequest(path:string,init?:RequestInit){
 const timeout=requestTimeout(15000);
 try{
 const response=await fetch('/_beta/api/'+path,{...init,signal:init?.signal||timeout.signal});
 if(!response.ok){const error=await response.json().catch(()=>({}));throw new Error(error.error||'Could not save beta changes.');}
 return await response.json();
 }catch(error){if(timeout.signal.aborted)throw new Error('The request timed out. Check your connection and try again.');throw error;}finally{timeout.clear();}
}
export const versionMatches=(actual:string|undefined|null,filter:string)=>filter==='All'||(filter==='Unassigned'?!actual:filter.endsWith('.x')?actual?.split('.')[0]===filter.split('.')[0]:actual===filter);
