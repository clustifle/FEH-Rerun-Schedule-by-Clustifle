import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import {X,Mail,Feather,Coins,Shield,Cat,Coffee,PawPrint} from 'lucide-react';
import {assetUrl} from './static-data';
import {usePreferences,reduceMotion} from './preferences';
import './EasterEggs.css';
const eggs=[
 {id:'feh',name:'Special delivery',image:'feh.png',selector:'.homepage',label:'Pick up the feather',icon:'feather',messages:['Feh checked the mailbox. Your orbs have mysteriously disappeared.','A new delivery! It contains one feather and absolutely no rerun predictions.','Feh recommends saving orbs. Feh also recommends opening every shiny orb.']},
 {id:'pixel',name:'Pocket-sized messenger',image:'pixel-feh.png',selector:'.about-minimal',label:'Touch the tiny pixel owl',icon:'pixel',messages:['64 pixels. Unlimited delivery potential.']},
 {id:'ferran',name:'Prime Ferran finishing challenge',image:'ferran.webp',selector:'.home-revivals',label:'Kick the little football',icon:'football',messages:['Open goal. Surely this time.']},
 {id:'maxwell',name:'A very unusual familiar',image:'maxwell.webp',selector:'.skills-directory',label:'Investigate the cat ears',icon:'cat',messages:['This unit has Canto: infinite rotation.']},
 {id:'pedro',name:'Dance of the raccoon',image:'pedro.webp',selector:'.weekly-revivals',label:'Touch the hidden raccoon paw',icon:'paw',messages:['No orbs. No worries. Just Pedro.']},
 {id:'fine',name:'Perfectly reasonable waiting',image:'fine.webp',selector:'.waitlist-board',label:'Pick up the steaming cup',icon:'cup',messages:['My favourite hero has no announced rerun. This is fine.','I have checked the schedule seventeen times today. Still fine.','The tea is cold. The waitlist is long. Everything is fine.']},
 {id:'anna',name:'Anna’s special offer',image:'feh.png',selector:'.schedule-export',label:'Pick up the mysterious gold coin',icon:'coin',messages:['Guaranteed rerun predictions: 999 orbs. Delivery date: definitely someday. All sales imaginary.','Premium waiting service: 50 orbs. Includes exactly the same amount of waiting.','Buy one imaginary prediction, get two imaginary delays free.']},
 {id:'greeting',name:'Nothing to report!',image:'feh.png',selector:'#mobile-navigation nav',label:'Inspect the little shield',icon:'shield',messages:['Greetings, Summoner! Your watchlist is safe. Your orb stash? No comment.','Nothing to report! Except that suspiciously shiny football.','Welcome back! The Heroes are ready. The rerun dates are another matter.']},
 {id:'quotes',name:'A message from Askr',image:'pixel-feh.png',selector:'.faq-content',label:'Open the forgotten envelope',icon:'envelope',messages:['“I’m saving my orbs.” — Summoner, moments before the next trailer.','The real five-star was the friend who told you to stop summoning.','One free summon. Five minutes of optimism.','My strategy is flawless. My orb balance disagrees.']},
 {id:'seasonal',name:'A visitor from another season',image:'feh.png',selector:'.homepage',label:'Inspect the seasonal decoration',icon:'seasonal',messages:['A seasonal delivery has arrived.']},
] as const;
type Egg=typeof eggs[number];type Mount={id:string;node:HTMLElement};
const misses=[
 {caption:'Destination: the next FEH banner.',x:'85%',y:'-30%',kind:'over'},
 {caption:'The goal remains unharmed.',x:'120%',y:'68%',kind:'wide'},
 {caption:'Precision. Wrong target.',x:'93%',y:'94%',kind:'corner'},
 {caption:'The warm-up continues.',x:'27%',y:'78%',kind:'slip'},
 {caption:'Someone check the Weekly Revival page.',x:'-45%',y:'-25%',kind:'out'},
 {caption:'HE FINALLY SCORED—wait. Wrong goal.',x:'3%',y:'25%',kind:'wrong'},
];
function objectIcon(egg:Egg){switch(egg.icon){case'football':return <span aria-hidden="true">⚽</span>;case'pixel':return <img src={assetUrl('easter-eggs/pixel-feh.png')} alt=""/>;case'feather':return <><Feather/><Mail size={14}/></>;case'cat':return <Cat/>;case'paw':return <PawPrint/>;case'cup':return <Coffee/>;case'coin':return <Coins/>;case'shield':return <Shield/>;case'envelope':return <Mail/>;default:return <span aria-hidden="true">{new Date().getMonth()===9?'🎃':new Date().getMonth()===11?'🎁':'🌼'}</span>;}}
export default function EasterEggs(){
 usePreferences(); // Re-render media when the motion preference changes.
 const [mounts,setMounts]=useState<Mount[]>([]),[active,setActive]=useState<Egg|null>(null),[message,setMessage]=useState(''),[paused,setPaused]=useState(false),[replayVersion,setReplayVersion]=useState(0);
 const [shot,setShot]=useState<'idle'|'flying'|'result'>('idle'),[attempts,setAttempts]=useState(0),[miss,setMiss]=useState(0);
 const dialog=useRef<HTMLDialogElement>(null),audio=useRef<HTMLAudioElement|null>(null),timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined),returnFocus=useRef<HTMLElement|null>(null),lastMessage=useRef(new Map<string,number>());
 function stopSound(){audio.current?.pause();if(audio.current)audio.current.currentTime=0;}
 function close(){clearTimeout(timer.current);stopSound();setActive(null);setShot('idle');}
 function freshMessage(egg:Egg){const old=lastMessage.current.get(egg.id)??-1;const index=egg.messages.length>1?(old+1)%egg.messages.length:0;lastMessage.current.set(egg.id,index);return egg.messages[index];}
 function open(egg:Egg,source:HTMLElement){clearTimeout(timer.current);stopSound();returnFocus.current=source;setMessage(freshMessage(egg));setPaused(false);setReplayVersion(v=>v+1);setAttempts(0);setShot('idle');setActive(egg);}
 function replay(){if(!active)return;setMessage(freshMessage(active));setPaused(false);setReplayVersion(v=>v+1);}
 function shoot(){
  if(shot==='flying')return;stopSound();const next=Math.floor(Math.random()*misses.length);setMiss(next);setAttempts(n=>n+1);setShot('flying');
  // The explicit Shoot interaction primes media playback; the shout begins at the miss.
  if(!audio.current)audio.current=new Audio(assetUrl('easter-eggs/ferraaaaan.mp3'));
  const sound=audio.current;sound.volume=.65;sound.muted=true;void sound.play().catch(()=>{});
  timer.current=setTimeout(()=>{setShot('result');sound.currentTime=0;sound.muted=false;void sound.play().catch(()=>{});},reduceMotion()?80:900);
 }
 useEffect(()=>{const node=dialog.current;if(active&&node&&!node.open){window.dispatchEvent(new Event('hero-preview-dismiss'));node.showModal();}else if(!active&&node?.open){node.close();if(returnFocus.current?.isConnected)returnFocus.current.focus({preventScroll:true});}},[active]);
 useEffect(()=>()=>{clearTimeout(timer.current);audio.current?.pause();},[]);
 useEffect(()=>{
  const nodes=new Map<string,HTMLElement>();let frame=0;
  const scan=()=>{const next:Mount[]=[];for(const egg of eggs){const host=document.querySelector<HTMLElement>(egg.selector);let node=nodes.get(egg.id);if(host){if(!node||node.parentElement!==host){node?.remove();node=document.createElement('span');node.dataset.eggMount=egg.id;node.className='egg-hiding-place egg-place-'+egg.id;host.append(node);nodes.set(egg.id,node);}next.push({id:egg.id,node});}else{node?.remove();nodes.delete(egg.id);}}
   setMounts(old=>old.length===next.length&&old.every((m,i)=>m.node===next[i].node)?old:next);
  };
  const observer=new MutationObserver(records=>{if(records.every(r=>r.target instanceof Element&&r.target.closest('[data-egg-mount],.egg-dialog')))return;cancelAnimationFrame(frame);frame=requestAnimationFrame(scan);});
  observer.observe(document.body,{childList:true,subtree:true});scan();
  const route=()=>{clearTimeout(timer.current);audio.current?.pause();setActive(null);};window.addEventListener('route-change',route);window.addEventListener('popstate',route);
  return()=>{observer.disconnect();cancelAnimationFrame(frame);nodes.forEach(node=>node.remove());window.removeEventListener('route-change',route);window.removeEventListener('popstate',route);};
 },[]);
 const seasonal=new Date().getMonth()===9?'🎃 Feh brought a pumpkin. It contains one feather and a suspicious noise.':new Date().getMonth()===11?'🎁 Feh brought a gift. It contains a scarf and an imaginary orb.':'🌼 Feh brought flowers. Your next summon is still a surprise.';
 const animated=active&&['maxwell','pedro','fine'].includes(active.id),still=reduceMotion()||paused;
 const media=active?assetUrl('easter-eggs/'+(animated&&still?active.id+'-still.webp':active.image)):'';
 return <>{mounts.map(m=>{const egg=eggs.find(e=>e.id===m.id)!;return createPortal(<button type="button" className={'egg-object egg-object-'+egg.id} aria-label={egg.label} title={egg.label} onClick={e=>open(egg,e.currentTarget)}>{objectIcon(egg)}</button>,m.node,m.id);})}
 <dialog ref={dialog} className="egg-dialog" aria-labelledby="egg-title" onCancel={e=>{e.preventDefault();close();}} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}}}>
 <header><h2 id="egg-title">{active?.name}</h2><button className="icon-button" aria-label="Close Easter egg" onClick={close}><X size={22}/></button></header>
 {active?.id==='ferran'?<div className="ferran-challenge"><p className="ferran-prompt">{shot==='idle'?'Open goal. Surely this time.':shot==='flying'?'Trust the process…':misses[miss].caption}</p><div className={'ferran-pitch shot-'+shot+' miss-'+misses[miss].kind} style={{'--shot-x':misses[miss].x,'--shot-y':misses[miss].y} as CSSProperties} aria-label="Miniature football pitch with an empty goal"><div className="pitch-circle"/><div className="pitch-goal"/><div className="pitch-wrong-goal"/><div className="pitch-player" aria-hidden="true"><span className="player-head"/><span className="player-shirt">7</span><span className="player-legs"/></div><span className="pitch-ball" key={attempts} aria-hidden="true">⚽</span><span className="pitch-corner" aria-hidden="true">⚑</span></div><p className="ferran-score">Attempts: {attempts} · Goals: emotionally, {attempts>=5?1:0}</p>{shot==='result'&&<div className="ferran-reaction"><img src={assetUrl('easter-eggs/ferran.webp')} alt="Ferran dog meme"/><strong>FEEEERRRRRRAAAAAAAAAN!</strong></div>}<button className="primary" disabled={shot==='flying'} onClick={shoot}>{shot==='flying'?'Taking the shot…':attempts===0?'Shoot':attempts>=5?'One more chance':attempts>=3?'Trust the process':'Shoot again'}</button></div>
 :active&&<div className={'egg-reveal egg-'+active.id}><img key={replayVersion} src={media} alt={active.name} className={'egg-art'+(['pixel','quotes'].includes(active.id)?' egg-pixel':'')}/>{active.id==='anna'&&<Coins size={36}/>}<p aria-live="polite">{active.id==='seasonal'?seasonal:message}</p><button className="secondary" onClick={()=>{if(active.id==='maxwell')setPaused(value=>!value);else replay();}}>{active.id==='maxwell'?(paused?'Spin again':'Stop spinning'):['feh','quotes','greeting','anna','fine'].includes(active.id)?'Another message':'Replay'}</button></div>}
 </dialog></>;
}
