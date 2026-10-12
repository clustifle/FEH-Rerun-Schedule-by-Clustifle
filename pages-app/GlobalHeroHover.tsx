import {useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import {Shield} from 'lucide-react';
import {portraitUrl} from './static-data';
import {HeroTypeTag,PoolTag,type Hero} from './HoverHeroTags';
import HeroPortraitMarks from './HeroPortraitMarks';
import HoverHeroSkills from './HoverHeroSkills';
import {waitlistLabel,isWaitlist} from './waitlist-types';
import './GlobalHeroHover.css';
export default function GlobalHeroHover({heroes}:{heroes:Hero[]}){
 const [preview,setPreview]=useState<{hero:Hero;x:number;y:number;container:HTMLElement}|null>(null);
 useEffect(()=>{
  const map=new Map(heroes.map(h=>[h.id,h]));let anchor:HTMLElement|null=null,lastTouch=0;
  let opening:ReturnType<typeof setTimeout>|undefined,closing:ReturnType<typeof setTimeout>|undefined;
  const cancelClose=()=>{clearTimeout(closing);closing=undefined;};
  const hide=()=>{clearTimeout(opening);opening=undefined;cancelClose();anchor=null;setPreview(null);};
  const popup=(value:EventTarget|null)=>value instanceof Element&&!!value.closest('#hero-hover-preview');
  const target=(value:EventTarget|null)=>value instanceof Element?value.closest<HTMLElement>('[data-hero-preview-id]'):null;
  const show=(e:Event)=>{
   if(e instanceof PointerEvent&&e.pointerType==='touch'){lastTouch=Date.now();hide();return;}
   if(e.type==='focusin'&&Date.now()-lastTouch<1000)return;
   if(popup(e.target)){cancelClose();return;}
   const element=target(e.target);if(!element)return;cancelClose();if(element===anchor)return;
   const hero=map.get(element.dataset.heroPreviewId||'');if(!hero)return;
   clearTimeout(opening);anchor=element;setPreview(null);
   opening=setTimeout(()=>{opening=undefined;if(!element.isConnected){hide();return;}const rect=element.getBoundingClientRect(),width=Math.min(320,innerWidth-24);setPreview({hero,container:element.closest<HTMLElement>('dialog[open]')||document.body,x:Math.max(12,Math.min(rect.right+14+width<=innerWidth-12?rect.right+14:rect.left-width-14,innerWidth-width-12)),y:Math.max(12,Math.min(rect.top,innerHeight-372))});},180);
  };
  const leave=(e:Event)=>{
   // Ignore unrelated document events; they must never cancel a pending dismissal.
   if(!popup(e.target)&&(!anchor||target(e.target)!==anchor))return;
   const next=(e as PointerEvent).relatedTarget;
   if(popup(next)||(anchor&&target(next)===anchor)){cancelClose();return;}
   clearTimeout(opening);opening=undefined;anchor=null;cancelClose();closing=setTimeout(hide,220);
  };
  const dismiss=(e:Event)=>{if(e.type==='scroll'&&popup(e.target))return;hide();};
  const keydown=(e:KeyboardEvent)=>{if(e.key==='Escape')hide();};
  hide();
  document.addEventListener('pointerover',show);document.addEventListener('focusin',show);document.addEventListener('pointerout',leave);document.addEventListener('focusout',leave);document.addEventListener('keydown',keydown);
  for(const event of ['scroll','resize','route-change','hero-preview-dismiss','blur'])window.addEventListener(event,dismiss,event==='scroll');
  return()=>{clearTimeout(opening);cancelClose();document.removeEventListener('pointerover',show);document.removeEventListener('focusin',show);document.removeEventListener('pointerout',leave);document.removeEventListener('focusout',leave);document.removeEventListener('keydown',keydown);for(const event of ['scroll','resize','route-change','hero-preview-dismiss','blur'])window.removeEventListener(event,dismiss,event==='scroll');};
 },[heroes]);
 if(!preview)return null;const h=preview.hero;return createPortal(<aside id="hero-hover-preview" className="hero-hover-preview global-hero-hover" role="tooltip" style={{left:preview.x,top:preview.y}}><div className="hover-hero-identity"><div className="hover-portrait">{h.portrait?<img src={portraitUrl(h.portrait)} alt=""/>:<Shield size={36}/>}<HeroPortraitMarks hero={h}/></div><div><h2>{h.name}</h2>{h.title&&<p className="hover-hero-title">{h.title}</p>}</div></div><div className="hover-hero-tags"><HeroTypeTag hero={h}/>{h.pool&&<PoolTag pool={h.pool}/>}</div>{h.demote&&<p className="hero-demote-note">Demote · 4–5★ summonable</p>}{h.schedule&&h.schedule!=='None'&&<div className="hover-hero-rerun"><span>{isWaitlist(h.schedule)?waitlistLabel(h.schedule):h.schedule==='General'?'L/M/E Schedule':h.schedule}</span><strong>{isWaitlist(h.schedule)?'Awaiting a rerun':h.month?new Date(h.month.slice(0,7)+'-01T12:00:00').toLocaleDateString('en-US',{month:'long',year:'numeric'}):'Month not announced'}</strong></div>}{h.notes&&<p className="hover-hero-note">{h.notes.length>160?h.notes.slice(0,157)+'…':h.notes}</p>}<HoverHeroSkills key={h.id} heroId={h.id} attuned={h.category==='Attuned'}/><p className="hover-hero-hint">Open the hero profile for more</p></aside>,preview.container)
}
