import {useEffect,useRef} from 'react';
import {getPreferences} from './preferences';
import {assetUrl} from './static-data';

export function useAutoRefresh(refresh:()=>Promise<void>,watchWebsite=false){
 const latest=useRef(refresh);latest.current=refresh;
 useEffect(()=>{
  let busy=false,disposed=false,pendingVersion:string|null=null;
  const canReload=()=>!document.querySelector('dialog[open]')&&!document.activeElement?.matches('input,textarea,select,[contenteditable="true"]');
  const tick=async(manual=false)=>{
   if(disposed||busy||document.visibilityState==='hidden'||!navigator.onLine)return;
   if(manual){
    if(document.querySelector('dialog[open]'))return;
    busy=true;
    try{await latest.current();}catch{/* Keep the last loaded data when offline. */}finally{busy=false;}
    return;
   }
   if(!watchWebsite||import.meta.env.DEV||!getPreferences().autoRefresh)return;
   busy=true;
   try{
    if(!pendingVersion){
     const response=await fetch(assetUrl('deployment.json'),{cache:'no-store',credentials:'omit'});
     if(!response.ok)return;
     const version=await response.json();
     if(typeof version.id==='string'&&version.id&&version.id!==import.meta.env.VITE_DEPLOYMENT_ID)pendingVersion=version.id;
    }
    if(pendingVersion&&!disposed&&canReload()){
     // Confirm the matching page has reached the hosting cache before reloading.
     const response=await fetch(assetUrl('index.html'),{cache:'no-store',credentials:'omit'});
     if(!response.ok)return;
     const html=new DOMParser().parseFromString(await response.text(),'text/html');
     if(html.querySelector('meta[name="deployment-id"]')?.getAttribute('content')===pendingVersion&&!disposed&&getPreferences().autoRefresh&&canReload())location.reload();
    }
   }catch{/* Failed or unfinished deployments leave the current page intact. */}
   finally{busy=false;}
  };
  const manual=()=>{void tick(true);};window.addEventListener('refresh-now',manual);
  const resume=()=>{void tick();};
  const timer=watchWebsite?setInterval(resume,60000):undefined;
  if(watchWebsite){
   void tick();window.addEventListener('focus',resume);window.addEventListener('online',resume);
   document.addEventListener('visibilitychange',resume);document.addEventListener('close',resume,true);
  }
  return()=>{
   disposed=true;window.removeEventListener('refresh-now',manual);clearInterval(timer);
   window.removeEventListener('focus',resume);window.removeEventListener('online',resume);
   document.removeEventListener('visibilitychange',resume);document.removeEventListener('close',resume,true);
  };
 },[watchWebsite]);
}
