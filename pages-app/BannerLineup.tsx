import {Plus,Pause,Play} from 'lucide-react';
import {portraitUrl} from './static-data';
import HeroPortraitMarks from './HeroPortraitMarks';
import {useEffect,useState,type ReactNode} from 'react';
import type {BannerHero} from './Homepage';
export type BannerLayout='lme'|'featured'|'revival'|'remix';
export type BannerMember={hero_id:string;slot_index?:number|null};
export const bannerColors=['Red','Blue','Green','Colorless'];
export function slotColor(layout:BannerLayout,index:number,size:number){return layout==='featured'?undefined:bannerColors[Math.floor((layout==='remix'?index%8:index)/(layout==='remix'?2:size/4))];}
export function arrangeSlots(layout:BannerLayout,members:BannerMember[],heroes:BannerHero[],savedSize?:number|null){
 const width=layout==='featured'?4:layout==='remix'?16:layout==='revival'?8:Math.max(savedSize||0,4*Math.max(3,...bannerColors.map(c=>members.filter(m=>heroes.find(h=>h.id===m.hero_id)?.color===c).length)));
 const result:(string|null)[]=Array(width).fill(null);
 for(const m of members){const hero=heroes.find(h=>h.id===m.hero_id);if(!hero)continue;const explicit=m.slot_index;
 const index=explicit!=null&&explicit>=0&&explicit<width&&slotColor(layout,explicit,width)=== (layout==='featured'?undefined:hero.color)&&!result[explicit]?explicit:result.findIndex((id,i)=>!id&&(!slotColor(layout,i,width)||slotColor(layout,i,width)===hero.color));if(index>=0)result[index]=m.hero_id;
 }return result;
}
export default function BannerLineup({layout,slots,heroes,editor=false,onSlot,card,active=true,playing=true}:{layout:BannerLayout;slots:(string|null)[];heroes:BannerHero[];editor?:boolean;active?:boolean;playing?:boolean;onSlot?:(index:number)=>void;card?:(h:BannerHero)=>ReactNode}){
 const [remixGroup,setRemixGroup]=useState(0),[remixPaused,setRemixPaused]=useState(false);
 useEffect(()=>{
  if(layout!=='remix'||editor||!active||!playing||remixPaused)return;
  const timer=setInterval(()=>{if(document.visibilityState==='visible'&&!document.querySelector('dialog[open]'))setRemixGroup(group=>1-group);},4500);
  return()=>clearInterval(timer);
 },[layout,editor,active,playing,remixPaused]);
 const renderSlot=(index:number)=>{const hero=heroes.find(h=>h.id===slots[index]);return editor?<button type="button" key={index} className={'banner-editor-slot'+(hero?' is-filled':' is-empty')} aria-label={(layout==='remix'?`Remix ${index<8?1:2} · `:'')+(slotColor(layout,index,slots.length)||'Featured')+` slot ${layout==='featured'?index+1:layout==='remix'?index%2+1:index%(slots.length/4)+1}`+(hero?` · ${hero.name}`:' · Select a hero')} onClick={()=>onSlot?.(index)}><span className="banner-editor-slot-portrait">{hero?.portrait?<img src={portraitUrl(hero.portrait)} alt=""/>:<Plus size={24}/>} {hero&&<HeroPortraitMarks hero={hero}/>}</span><strong>{hero?.name||'Select hero'}</strong><small>{hero?'Change hero':'Empty slot'}</small></button>:<div key={index} className="banner-lineup-slot">{hero?card?.(hero):<span className="banner-empty-slot" aria-hidden="true">◇</span>}</div>;};
 if(layout==='featured')return <div className="banner-editor-featured-slots">{slots.map((_,i)=>renderSlot(i))}</div>;
 const perColor=layout==='remix'?2:slots.length/4;
 if(layout==='remix'){
  const panels=[0,1].map(group=><section className={'responsive-remix-panel'+(!editor&&group===remixGroup?' is-visible':'')} key={group} inert={!editor&&group!==remixGroup} aria-label={`Remix ${group+1}`}><h3>Remix {group+1}{editor&&<small>{slots.slice(group*8,group*8+8).filter(Boolean).length}/8 heroes</small>}</h3>{bannerColors.map((color,c)=><div className="banner-lineup-row" key={color}><div className={'color-label '+color.toLowerCase()}><span>{color}</span></div><div className={'color-slot banner-lineup-group '+color.toLowerCase()}>{[0,1].map(i=>renderSlot(group*8+c*2+i))}</div></div>)}</section>);
  return editor?<div className="responsive-remix-lineup" aria-label="Remix banners and hero slots">{panels}</div>:<div className="remix-viewer" aria-label="Remix banner lineups"><div className="remix-viewer-controls" role="group" aria-label="Choose Remix lineup">{[0,1].map(group=><button type="button" key={group} aria-pressed={remixGroup===group} onClick={()=>setRemixGroup(group)}>Remix {group+1}</button>)}<button type="button" aria-label={remixPaused?'Play Remix transition':'Pause Remix transition'} aria-pressed={remixPaused} onClick={()=>setRemixPaused(value=>!value)}>{remixPaused?<Play size={15}/>:<Pause size={15}/>}</button></div><div className="remix-viewer-panels">{panels}</div></div>;
 }
 return <div className={'banner-lineup-scroll'+(editor?' is-editor':'')} tabIndex={editor?0:undefined} aria-label="Banner hero slots"><div className="banner-lineup-grid">
 {bannerColors.map((color,c)=><div className="banner-lineup-row" key={color}><div className={'color-label '+color.toLowerCase()}><span>{color}</span></div><div className={'color-slot banner-lineup-group '+color.toLowerCase()} style={{gridTemplateColumns:editor?`repeat(${perColor},minmax(0,1fr))`:'repeat(auto-fit,minmax(min(100%,88px),1fr))'}}>{Array.from({length:perColor},(_,i)=>renderSlot(c*perColor+i))}</div></div>)}
 </div></div>;
}
