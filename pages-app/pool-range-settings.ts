import {requestTimeout} from './browser-compat';
import {useEffect,useSyncExternalStore} from 'react';
import config from './poll-config.json';
import {getPoolRangeSettings,setPoolRangeSettings,subscribePoolRangeSettings,type PoolRangeSettings} from './hero-pools';
let pending:Promise<void>|null=null,lastLoad=0,watchers=0,timer:ReturnType<typeof setInterval>|null=null;
export function loadPoolRangeSettings(force=false){
 if(import.meta.env.VITE_SITE_CHANNEL==='beta')return Promise.resolve();
 if(pending)return pending;if(!force&&Date.now()-lastLoad<15000)return Promise.resolve();
 const timeout=requestTimeout(15000);
 pending=fetch(config.url.replace(/\/$/,'')+'/community/pool-ranges',{credentials:'omit',cache:'no-store',signal:timeout.signal}).then(async response=>{if(!response.ok)throw Error('Could not load SR / SHSR settings.');const value=await response.json() as PoolRangeSettings;setPoolRangeSettings(value);lastLoad=Date.now();}).finally(()=>{timeout.clear();pending=null;});return pending;
}
const refresh=()=>{if(document.visibilityState==='visible')void loadPoolRangeSettings().catch(()=>{});};
export function usePoolRangeSettings(){
 useEffect(()=>{void loadPoolRangeSettings().catch(()=>{});if(++watchers===1){window.addEventListener('focus',refresh);window.addEventListener('online',refresh);timer=setInterval(refresh,60000);}return()=>{if(--watchers===0){window.removeEventListener('focus',refresh);window.removeEventListener('online',refresh);if(timer)clearInterval(timer);timer=null;}};},[]);
 return useSyncExternalStore(subscribePoolRangeSettings,getPoolRangeSettings);
}
