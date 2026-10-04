import {useEffect,useRef} from 'react';
import {getPreferences} from './preferences';
import {assetUrl} from './static-data';

export function useAutoRefresh(refresh:()=>Promise<void>,watchWebsite=false){
 const latest=useRef(refresh);latest.current=refresh;
 useEffect(()=>{
  let busy=false,disposed=false,lastVersionCheck=0,pendingVersion=false;
  const currentScript=document.querySelector<HTMLScriptElement>('script[type="module"][src]')?.src;
  const tick=async(force=false)=>{
   if((!force&&!getPreferences().autoRefresh)||disposed||busy||document.visibilityState==='hidden'||!navigator.onLine)return;
   // Keep every unsaved editor form intact, including sign-in and manager dialogs.
   if(document.querySelector('dialog[open] form'))return;
   busy=true;
   try{
    await latest.current();
    if(watchWebsite&&!import.meta.env.DEV&&currentScript&&Date.now()-lastVersionCheck>=60000){
     lastVersionCheck=Date.now();
     const response=await fetch(assetUrl('index.html'),{cache:'no-store',credentials:'omit'});
     if(response.ok){
      const html=new DOMParser().parseFromString(await response.text(),'text/html');
      const source=html.querySelector('script[type="module"][src]')?.getAttribute('src');
      if(source&&new URL(source,location.href).href!==currentScript)pendingVersion=true;
     }
    }
    if(!disposed&&pendingVersion&&!document.querySelector('dialog[open]')&&!document.activeElement?.matches('input,textarea,select,[contenteditable="true"]'))location.reload();
   }catch{/* Retain the current data during a temporary connection failure. */}
   finally{busy=false;}
  };
  const timer=setInterval(()=>{void tick();},30000);
  const resume=()=>{void tick();};const manual=()=>{void tick(true);};window.addEventListener('refresh-now',manual);
  window.addEventListener('focus',resume);window.addEventListener('online',resume);
  document.addEventListener('visibilitychange',resume);
  document.addEventListener('close',resume,true);
  return()=>{window.removeEventListener('refresh-now',manual);disposed=true;clearInterval(timer);window.removeEventListener('focus',resume);window.removeEventListener('online',resume);document.removeEventListener('visibilitychange',resume);document.removeEventListener('close',resume,true);};
 },[watchWebsite]);
}
