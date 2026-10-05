import {useEffect,useState} from 'react';
// Tick each second only while a visible countdown is in its final day.
export default function useBannerClock(periods:{start:number;end:number}[]){
 const [now,setNow]=useState(Date.now);
 const key=periods.map(p=>p.start+':'+p.end).join(',');
 useEffect(()=>{let timer:ReturnType<typeof setTimeout>|undefined;const ranges=key.split(',').filter(Boolean).map(value=>{const [start,end]=value.split(':').map(Number);return {start,end};});
 const tick=()=>{clearTimeout(timer);if(document.visibilityState==='hidden')return;const time=Date.now();setNow(time);let delay=60000;for(const {start,end} of ranges){if(time>=start&&time<end&&end-time<=86400000)delay=Math.min(delay,1000-time%1000);for(const boundary of [start,end-86400000,end])if(boundary>time)delay=Math.min(delay,boundary-time);}timer=setTimeout(tick,Math.max(16,delay));};
 tick();window.addEventListener('focus',tick);document.addEventListener('visibilitychange',tick);return()=>{clearTimeout(timer);window.removeEventListener('focus',tick);document.removeEventListener('visibilitychange',tick);};
 },[key]);return now;
}
