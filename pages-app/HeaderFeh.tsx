import {useEffect,useRef,useState} from 'react';
import {assetUrl} from './static-data';
import './HeaderFeh.css';

export default function HeaderFeh(){
 const [mood,setMood]=useState<'awake'|'happy'|'sleepy'>('awake'),[version,setVersion]=useState(0);
 const timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined),taps=useRef({count:0,time:0});
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 function interact(){
  clearTimeout(timer.current);
  const now=Date.now();taps.current={count:now-taps.current.time<2500?taps.current.count+1:1,time:now};
  const next=taps.current.count%3===2?'sleepy':taps.current.count%3===0?'awake':'happy';
  setMood(next);setVersion(v=>v+1);
  timer.current=setTimeout(()=>{setMood('awake');taps.current={count:0,time:0};},next==='sleepy'?8000:2200);
 }
 return <button type="button" className={'header-feh owl-'+mood} aria-label="Interact with Feh" title="Interact with Feh" onClick={interact} onPointerEnter={()=>{if(mood==='awake'&&taps.current.count===0)setMood('happy');}} onPointerLeave={()=>{if(mood==='happy'&&taps.current.count===0)setMood('awake');}}><span className="header-feh-pose"><span key={version} className="header-feh-art" role="img" aria-label={'Feh, '+mood}>{(['awake','happy','sleepy'] as const).map(expression=><img key={expression} className={'feh-expression'+(expression===mood?' is-current':'')} src={assetUrl('feh/feh-'+expression+'.png')} alt="" aria-hidden="true" decoding="async"/>)}</span></span><span className="feh-sleep-indicators" aria-hidden="true"><span>z</span><span>z</span><span>z</span></span></button>;
}
