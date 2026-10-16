import {useEffect,useState,useSyncExternalStore} from 'react';
import {communityApi} from './community-api';
import {ForumDraftSync,type DraftRecord,type ForumDraft} from './forum-draft-sync';
export function useForumDraft(accountId:string,defaults:ForumDraft,enabled:boolean){
 const [sync]=useState(()=>{let storage:Storage|null=null;try{storage=localStorage;}catch{}return new ForumDraftSync(defaults,(method,body)=>communityApi<DraftRecord>('/draft',body,method,accountId),storage,accountId,enabled);});
 const snapshot=useSyncExternalStore(sync.subscribe,sync.getSnapshot);
 useEffect(()=>{
  if(!enabled)return;sync.start();
  const refresh=()=>{if(document.visibilityState==='visible')void sync.refresh();};
  const local=(event:StorageEvent)=>{if(event.key===sync.key)refresh();};
  window.addEventListener('focus',refresh);window.addEventListener('online',refresh);document.addEventListener('visibilitychange',refresh);window.addEventListener('storage',local);
  const timer=setInterval(refresh,15000);
  return()=>{clearInterval(timer);window.removeEventListener('focus',refresh);window.removeEventListener('online',refresh);document.removeEventListener('visibilitychange',refresh);window.removeEventListener('storage',local);sync.stop();};
 },[sync,enabled]);
 return {...snapshot,sync};
}
