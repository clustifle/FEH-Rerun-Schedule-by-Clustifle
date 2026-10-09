export const isBeta=import.meta.env.VITE_SITE_CHANNEL==='beta';
export async function betaRequest(path:string,init?:RequestInit){
 const response=await fetch('/_beta/api/'+path,init);
 if(!response.ok){const error=await response.json().catch(()=>({}));throw new Error(error.error||'Could not save beta changes.');}
 return response.json();
}
export const versionMatches=(actual:string|undefined|null,filter:string)=>filter==='All'||(filter==='Unassigned'?!actual:filter.endsWith('.x')?actual?.split('.')[0]===filter.split('.')[0]:actual===filter);
