import {useEffect,useRef,useState} from 'react';
import {X,Sparkles,Coins,LockKeyhole,Volume2,VolumeX,ArrowLeft} from 'lucide-react';
import {assetUrl} from './static-data';
import {usePreferences,setPreferences,reduceMotion} from './preferences';
import './EasterEggs.css';
const eggs=[
 {id:'feh',name:'Special delivery',image:'feh.png',text:'Feh checked the mailbox. Your orbs have mysteriously disappeared.',hint:'Tap the site logo five times.',code:'feh'},
 {id:'pixel',name:'Pocket-sized messenger',image:'pixel-feh.png',text:'64 pixels. Unlimited delivery potential.',hint:'A tiny owl likes the word pixel.',code:'pixel'},
 {id:'wrys',name:'The legendary pity breaker',image:'wrys.webp',text:'You expected a rare summon. You received emotional support. ★★★',hint:'Who always answers a colourless summon?',code:'wrys'},
 {id:'ferran',name:'FEEEERRRRRRAAAAAAAAAN!',image:'ferran.webp',text:'The Order of Heroes has signed a new striker.',hint:'An unexpected striker: type ferran.',code:'ferran'},
 {id:'maxwell',name:'A very unusual familiar',image:'maxwell.webp',text:'This unit has Canto: infinite rotation.',hint:'A spinning cat answers to maxwell.',code:'maxwell'},
 {id:'pedro',name:'Dance of the raccoon',image:'pedro.webp',text:'No orbs. No worries. Just Pedro.',hint:'Type pedro to start the party.',code:'pedro'},
 {id:'fine',name:'Perfectly reasonable waiting',image:'fine.webp',text:'My favourite hero has no announced rerun. This is fine.',hint:'When everything is perfectly fine…',code:'fine'},
 {id:'fomortiis',name:'The Cursed Orb',image:'fomortiis.webp',text:'You opened the wrong summoning portal. The Demon King would also like a rerun.',hint:'The cursed orb answers to fomortiis.',code:'fomortiis'},
 {id:'anna',name:"Anna’s special offer",image:'feh.png',text:'Guaranteed rerun predictions: 999 orbs. Delivery date: definitely someday. All sales imaginary.',hint:'A merchant named anna has an offer.',code:'anna'},
 {id:'greeting',name:'Nothing to report!',image:'feh.png',text:'Greetings, Summoner! Your watchlist is safe. Your orb stash? No comment.',hint:'↑ ↑ ↓ ↓ ← → ← → B A',code:'greetings'},
 {id:'quotes',name:'A message from Askr',image:'pixel-feh.png',text:'“I’m saving my orbs.” — Summoner, moments before the next trailer.',hint:'Ask for a secret quote.',code:'quote'},
 {id:'seasonal',name:'A visitor from another season',image:'feh.png',text:'The seasonal delivery has arrived.',hint:'Type seasonal for a visiting messenger.',code:'seasonal'},
] as const;
type Egg=typeof eggs[number];
function readDiscoveries():string[]{try{const saved=JSON.parse(localStorage.getItem('feh-egg-discoveries')||'[]');return Array.isArray(saved)?saved.filter(id=>eggs.some(e=>e.id===id)):[];}catch{return [];}}
export default function EasterEggs(){
 const prefs=usePreferences(),dialog=useRef<HTMLDialogElement>(null),audio=useRef<HTMLAudioElement|null>(null),last=useRef(0),sessionSeen=useRef(new Set<string>());
 const [seen,setSeen]=useState(readDiscoveries),[collection,setCollection]=useState(false),[active,setActive]=useState<Egg|null>(null),[cursed,setCursed]=useState(false),[playing,setPlaying]=useState(false);
 const visible=collection||!!active||cursed;
 function stopSound(){audio.current?.pause();if(audio.current)audio.current.currentTime=0;setPlaying(false);}
 function close(){stopSound();setCollection(false);setActive(null);setCursed(false);}
 function playFerran(){stopSound();const sound=audio.current||new Audio(assetUrl('easter-eggs/ferraaaaan.mp3'));audio.current=sound;sound.volume=.65;sound.onended=()=>setPlaying(false);void sound.play().then(()=>setPlaying(true)).catch(()=>setPlaying(false));}
 function reveal(egg:Egg,manual=true){
  if(!prefs.easterEggs)return;
  if(!manual&&(document.querySelector('dialog[open]')||document.activeElement?.closest('input,textarea,select,[contenteditable="true"]')||sessionSeen.current.has(egg.id)||Date.now()-last.current<1500))return;
  stopSound();if(egg.id==='fomortiis'&&!prefs.eggSpooky){setCursed(true);setCollection(false);setActive(null);return;}
  last.current=Date.now();sessionSeen.current.add(egg.id);setCursed(false);setCollection(false);setActive(egg);
  setSeen(old=>{const next=old.includes(egg.id)?old:[...old,egg.id];try{localStorage.setItem('feh-egg-discoveries',JSON.stringify(next));}catch{}return next;});
  if(egg.id==='ferran'&&prefs.eggSound)playFerran();
 }
 useEffect(()=>{const node=dialog.current;if(visible&&node&&!node.open){window.dispatchEvent(new Event('hero-preview-dismiss'));node.showModal();}else if(!visible&&node?.open)node.close();},[visible]);
 useEffect(()=>{if(!prefs.easterEggs)close();if(!prefs.eggSound)stopSound();},[prefs.easterEggs,prefs.eggSound]);
 useEffect(()=>()=>{audio.current?.pause();},[]);
 useEffect(()=>{
  let buffer='',sequence='',taps=0,lastTap=0,lastKey=0;
  const stash=()=>{if(prefs.easterEggs){stopSound();setActive(null);setCursed(false);setCollection(true);}};
  const click=(e:MouseEvent)=>{if(!(e.target instanceof Element)||!e.target.closest('.feh-wordmark,.settings-about-logo')||!prefs.easterEggs)return;const now=Date.now();taps=now-lastTap<2000?taps+1:1;lastTap=now;if(taps===5){taps=0;reveal(eggs[0],false);}};
  const key=(e:KeyboardEvent)=>{
   if(e.ctrlKey||e.metaKey||e.altKey||e.repeat||!prefs.easterEggs||e.target instanceof Element&&e.target.closest('input,textarea,select,[contenteditable="true"],dialog[open]'))return;
   if(Date.now()-lastKey>2000){buffer='';sequence='';}lastKey=Date.now();
   const keys:Record<string,string>={ArrowUp:'U',ArrowDown:'D',ArrowLeft:'L',ArrowRight:'R',b:'B',a:'A'};sequence=(sequence+(keys[e.key]||'')).slice(-10);
   if(sequence==='UUDDLRLRBA'){sequence='';reveal(eggs.find(egg=>egg.id==='greeting')!,false);return;}
   if(e.key.length!==1)return;buffer=(buffer+e.key.toLowerCase()).slice(-16);const found=eggs.find(egg=>buffer.endsWith(egg.code));if(found){buffer='';reveal(found,false);}
  };
  window.addEventListener('easter-egg-open',stash);document.addEventListener('click',click,true);document.addEventListener('keydown',key);
  return()=>{window.removeEventListener('easter-egg-open',stash);document.removeEventListener('click',click,true);document.removeEventListener('keydown',key);};
 },[prefs.easterEggs,prefs.eggSound,prefs.eggSpooky]);
 const seasonal=new Date().getMonth()===9?'🎃 Feh brought a pumpkin. It contains one feather and a suspicious noise.':new Date().getMonth()===11?'❄ Feh brought a gift. You shake it. It sounds like another Wrys.':'✿ Feh brought flowers. Your next summon is still a surprise.';
 const media=active?assetUrl('easter-eggs/'+(reduceMotion()&&['maxwell','pedro','fine'].includes(active.id)?active.id+'-still.webp':active.image)):'';
 return <>{prefs.easterEggs&&<button className="egg-stash-launcher" aria-label="Open Anna’s Secret Stash" title="Something sparkles here…" onClick={()=>{setActive(null);setCursed(false);setCollection(true);}}><Sparkles size={19}/></button>}
 <dialog ref={dialog} className={'egg-dialog'+(active?.id==='fomortiis'?' egg-cursed':'')} aria-labelledby="egg-title" onCancel={e=>{e.preventDefault();close();}} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}}}>
 <header><div><span className="egg-dialog-ornament" aria-hidden="true">✦</span><h2 id="egg-title">{cursed?'A strange summoning orb':active?.name||"Anna’s Secret Stash"}</h2></div><button className="icon-button" aria-label="Close Easter egg" onClick={close}><X size={22}/></button></header>
 {cursed?<div className="egg-reveal"><img className="egg-orb" src={assetUrl('weapon-orbs/colorless.webp')} alt="Cursed summoning orb"/><p>This opens a spooky Demon King surprise. Sound follows your sound setting.</p><button className="primary" onClick={()=>{setPreferences({eggSpooky:true});setCursed(false);setActive(eggs.find(e=>e.id==='fomortiis')!);setSeen(old=>{const next=old.includes('fomortiis')?old:[...old,'fomortiis'];try{localStorage.setItem('feh-egg-discoveries',JSON.stringify(next));}catch{}return next;});}}>Enable spooky surprises & open orb</button><button className="secondary" onClick={close}>Leave the orb alone</button></div>
 :active?<div className={'egg-reveal egg-'+active.id} key={active.id}><img src={media} alt={active.name} className={'egg-art'+(active.id==='pixel'||active.id==='quotes'?' egg-pixel':'')}/>{active.id==='anna'&&<Coins size={40}/>}<p>{active.id==='seasonal'?seasonal:active.text}</p>{active.id==='ferran'&&<button className="secondary" onClick={()=>{if(playing)stopSound();else{setPreferences({eggSound:true});playFerran();}}}>{playing?<VolumeX size={18}/>:<Volume2 size={18}/>} {playing?'Stop sound':'Play Ferran audio'}</button>}<button className="secondary egg-back" onClick={()=>{stopSound();setActive(null);setCollection(true);}}><ArrowLeft size={17}/>Back to discoveries</button></div>
 :<div className="egg-collection"><p className="egg-progress">{seen.length} / {eggs.length} discoveries · Saved on this device</p><div className="egg-collection-grid">{eggs.map(egg=><button className={'egg-discovery'+(seen.includes(egg.id)?' is-found':'')} key={egg.id} onClick={()=>reveal(egg)}><span className="egg-discovery-icon">{seen.includes(egg.id)?<img src={assetUrl('easter-eggs/'+(['maxwell','pedro','fine'].includes(egg.id)?egg.id+'-still.webp':egg.image))} alt="" loading="lazy"/>:<LockKeyhole size={23}/>}</span><span><strong>{seen.includes(egg.id)?egg.name:'Undiscovered'}</strong><small>{egg.hint}</small><em>{seen.includes(egg.id)?'Replay':'Try this clue'}</em></span></button>)}</div><div className="egg-options"><label><input type="checkbox" checked={prefs.eggSound} onChange={e=>setPreferences({eggSound:e.target.checked})}/>Sound</label><label><input type="checkbox" checked={prefs.eggSpooky} onChange={e=>setPreferences({eggSpooky:e.target.checked})}/>Spooky surprises</label></div><p className="egg-credits">Game artwork © Nintendo / INTELLIGENT SYSTEMS. Meme sources and credits: <a href={assetUrl('easter-eggs/credits.txt')} target="_blank" rel="noopener noreferrer">view credits</a>.</p></div>}
 </dialog></>;
}
