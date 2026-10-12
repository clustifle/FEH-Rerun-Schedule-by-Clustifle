import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Mail,Coins,Cat,Coffee,PawPrint} from 'lucide-react';
import {assetUrl} from './static-data';
import {usePreferences,reduceMotion} from './preferences';
import './EasterEggs.css';
const eggs=[
 {id:'feh',name:'Special delivery',image:'feh-awake.png',selector:'.masthead',label:'Interact with Feh',icon:'owl',messages:['Feh checked the mailbox. Your orbs have mysteriously disappeared.','A new delivery! It contains one feather and absolutely no rerun predictions.','Feh recommends saving orbs. Feh also recommends opening every shiny orb.']},
 {id:'pixel',name:'Pocket-sized messenger',image:'pixel-feh.png',selector:'.about-minimal',label:'Touch the tiny pixel owl',icon:'pixel',messages:['64 pixels. Unlimited delivery potential.']},
 {id:'ferran',name:'FEEEERRRRRRAAAAAAAAAN!',image:'ferran.webp',selector:'',label:'Ferran search surprise',icon:'football',messages:['The goal remains unharmed.']},
 {id:'maxwell',name:'A very unusual familiar',image:'maxwell.webp',selector:'.skills-directory',label:'Investigate the cat ears',icon:'cat',messages:['This unit has Canto: infinite rotation.']},
 {id:'pedro',name:'Dance of the raccoon',image:'pedro.webp',selector:'.weekly-revivals',label:'Touch the hidden raccoon paw',icon:'paw',messages:['No orbs. No worries. Just Pedro.']},
 {id:'fine',name:'Perfectly reasonable waiting',image:'fine.webp',selector:'.waitlist-board',label:'Pick up the steaming cup',icon:'cup',messages:['My favourite hero has no announced rerun. This is fine.','I have checked the schedule seventeen times today. Still fine.','The tea is cold. The waitlist is long. Everything is fine.']},
 {id:'anna',name:'Anna’s special offer',image:'feh.png',selector:'.schedule-export',label:'Pick up the mysterious gold coin',icon:'coin',messages:['Guaranteed rerun predictions: 999 orbs. Delivery date: definitely someday. All sales imaginary.','Premium waiting service: 50 orbs. Includes exactly the same amount of waiting.','Buy one imaginary prediction, get two imaginary delays free.']},
 {id:'greeting',name:'Nothing to report!',image:'feh.png',selector:'.schedule',label:'Inspect the little shield',icon:'shield',messages:['Greetings, Summoner! Your watchlist is safe. Your orb stash? No comment.','Nothing to report! Someone is looking for a striker, though.','Welcome back! The Heroes are ready. The rerun dates are another matter.']},
 {id:'quotes',name:'A message from Askr',image:'pixel-feh.png',selector:'.faq-content',label:'Open the forgotten envelope',icon:'envelope',messages:['“I’m saving my orbs.” — Summoner, moments before the next trailer.','The real five-star was the friend who told you to stop summoning.','One free summon. Five minutes of optimism.','My strategy is flawless. My orb balance disagrees.']},
 {id:'seasonal',name:'A visitor from another season',image:'feh.png',selector:'.homepage',label:'Inspect the seasonal decoration',icon:'seasonal',messages:['A seasonal delivery has arrived.']},
] as const;
type Egg=typeof eggs[number];type Mount={id:string;node:HTMLElement};
function objectIcon(egg:Egg){switch(egg.icon){case'football':return <span aria-hidden="true">⚽</span>;case'pixel':return <img src={assetUrl('easter-eggs/pixel-feh.png')} alt=""/>;case'cat':return <Cat/>;case'paw':return <PawPrint/>;case'cup':return <Coffee/>;case'coin':return <Coins/>;case'shield':return <img src={assetUrl('easter-eggs/askr-emblem.png')} alt=""/>;case'envelope':return <Mail/>;default:return <span aria-hidden="true">{new Date().getMonth()===9?'🎃':new Date().getMonth()===11?'🎁':'🌼'}</span>;}}

function VisualEffect({id}:{id:string}){
 const season=new Date().getMonth()===9?'halloween':new Date().getMonth()===11?'winter':'spring';
 if(!['seasonal','anna','greeting','quotes'].includes(id))return null;
 return <span className={'egg-visual egg-visual-'+id+' '+(id==='seasonal'?season:'')} role="img" aria-label={id==='seasonal'?season+' decoration comes to life':id==='anna'?'Gold coins spill into an orb purse':id==='greeting'?'Askr emblem rises inside a glowing shield':'An envelope opens with a tiny owl delivery'}>
 {id==='seasonal'&&<><span className="season-center">{season==='halloween'?'🎃':season==='winter'?'🎁':'🌷'}</span>{Array.from({length:7},(_,i)=><span key={i} className={'egg-particle particle-'+i}>{season==='halloween'?(i%2?'🦇':'👻'):season==='winter'?(i%2?'❄':'🔮'):(i%2?'🌸':'🦋')}</span>)}</>}
 {id==='anna'&&<><span className="orb-purse">👝</span>{Array.from({length:7},(_,i)=><span key={i} className={'egg-particle particle-'+i}>🪙</span>)}</>}
 {id==='greeting'&&<><span className="askr-aegis"><img src={assetUrl('easter-eggs/askr-emblem.png')} alt=""/><span className="aegis-shine"/></span><span className="aegis-ring"/><span className="aegis-ring ring-two"/></>}
 {id==='quotes'&&<><span className="delivery-envelope">✉</span><img className="delivery-owl" src={assetUrl('easter-eggs/pixel-feh.png')} alt=""/><span className="delivery-star">✦</span></>}
 </span>;
}

export default function EasterEggs(){
 usePreferences();
 const [mounts,setMounts]=useState<Mount[]>([]),[active,setActive]=useState<string|null>(null),[owlMood,setOwlMood]=useState<'awake'|'happy'|'sleepy'>('awake'),[scene,setScene]=useState(false),[version,setVersion]=useState(0);
 const audio=useRef<HTMLAudioElement|null>(null),effectTimer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined),owlTimer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined),sceneTimer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined),taps=useRef({count:0,time:0});
 function stopSound(){audio.current?.pause();if(audio.current)audio.current.currentTime=0;}
 function dismissScene(){clearTimeout(sceneTimer.current);stopSound();setScene(false);}
 function interact(egg:Egg){
  if(egg.id==='feh'){
   clearTimeout(owlTimer.current);setVersion(v=>v+1);const now=Date.now();taps.current={count:now-taps.current.time<2500?taps.current.count+1:1,time:now};
   const mood=taps.current.count%3===2?'sleepy':taps.current.count%3===0?'awake':'happy';setOwlMood(mood);owlTimer.current=setTimeout(()=>{setOwlMood('awake');taps.current={count:0,time:0};},mood==='sleepy'?8000:2200);return;
  }
  clearTimeout(effectTimer.current);if(active===egg.id){setActive(null);return;}
  setVersion(v=>v+1);setActive(egg.id);effectTimer.current=setTimeout(()=>setActive(null),6500);
 }
 useEffect(()=>{
  const surprise=()=>{if(!document.querySelector('.user-directory'))return;dismissScene();window.dispatchEvent(new Event('hero-preview-dismiss'));setVersion(v=>v+1);setScene(true);const sound=audio.current||new Audio(assetUrl('easter-eggs/ferraaaaan.mp3'));audio.current=sound;sound.volume=.65;sound.muted=false;sound.onended=dismissScene;void sound.play().catch(()=>{});sceneTimer.current=setTimeout(dismissScene,8000);};
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){dismissScene();setActive(null);}};
  const hide=()=>{dismissScene();setActive(null);};
  const visibility=()=>{if(document.hidden)hide();};
  window.addEventListener('ferran-search-surprise',surprise);document.addEventListener('keydown',key);window.addEventListener('route-change',hide);window.addEventListener('popstate',hide);document.addEventListener('visibilitychange',visibility);
  return()=>{clearTimeout(effectTimer.current);clearTimeout(owlTimer.current);clearTimeout(sceneTimer.current);audio.current?.pause();window.removeEventListener('ferran-search-surprise',surprise);document.removeEventListener('keydown',key);window.removeEventListener('route-change',hide);window.removeEventListener('popstate',hide);document.removeEventListener('visibilitychange',visibility);};
 },[]);
 useEffect(()=>{
  const nodes=new Map<string,HTMLElement>();let frame=0;
  const scan=()=>{const next:Mount[]=[];for(const egg of eggs){const host=egg.selector?document.querySelector<HTMLElement>(egg.selector):null;let node=nodes.get(egg.id);if(host){if(!node||node.parentElement!==host){node?.remove();node=document.createElement('span');node.dataset.eggMount=egg.id;node.className='egg-hiding-place egg-place-'+egg.id;host.append(node);nodes.set(egg.id,node);}next.push({id:egg.id,node});}else{node?.remove();nodes.delete(egg.id);}}setMounts(old=>old.length===next.length&&old.every((m,i)=>m.node===next[i].node)?old:next);};
  const observer=new MutationObserver(records=>{if(records.every(r=>r.target instanceof Element&&r.target.closest('[data-egg-mount],.ferran-scene')))return;cancelAnimationFrame(frame);frame=requestAnimationFrame(scan);});observer.observe(document.body,{childList:true,subtree:true});scan();
  return()=>{observer.disconnect();cancelAnimationFrame(frame);nodes.forEach(node=>node.remove());};
 },[]);
 return <>{mounts.map(m=>{const egg=eggs.find(e=>e.id===m.id)!,running=active===egg.id,animated=['maxwell','pedro','fine'].includes(egg.id),media=assetUrl('easter-eggs/'+(animated&&reduceMotion()?egg.id+'-still.webp':egg.image));return createPortal(<span className={'egg-direct'+(running?' is-active':'')}>
 <button type="button" className={'egg-object egg-object-'+egg.id+(running?' is-active':'')+(egg.id==='feh'?' owl-'+owlMood:'')} aria-label={egg.label} title={egg.label} onClick={()=>interact(egg)} onPointerEnter={()=>{if(egg.id==='feh'&&owlMood==='awake'&&taps.current.count===0)setOwlMood('happy');}} onPointerLeave={()=>{if(egg.id==='feh'&&owlMood==='happy'&&taps.current.count===0)setOwlMood('awake');}}>
 {egg.id==='feh'?<img key={version} src={assetUrl('easter-eggs/feh-'+owlMood+'.png')} alt={'Feh, '+owlMood}/>:running&&['pixel','maxwell','pedro','fine'].includes(egg.id)?<img key={version} className="egg-inline-art" src={media} alt={egg.name}/>:objectIcon(egg)}
 </button>{running&&<VisualEffect key={version} id={egg.id}/>}
 </span>,m.node,m.id);})}
 {scene&&createPortal(<div className="ferran-scene" role="img" aria-label="Ferran search surprise" onClick={dismissScene}><img key={version} src={assetUrl('easter-eggs/ferran.webp')} alt="Ferran dog meme"/><span>FEEEERRRRRRAAAAAAAAAN!</span></div>,document.body)}
 </>;
}
