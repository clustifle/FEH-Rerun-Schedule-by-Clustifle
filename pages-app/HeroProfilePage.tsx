import {isBeta} from './beta';
import './HeroProfilePage.css';
import {V2HeroInfo} from './V2Workspace';
import {useEffect,useRef,type ReactNode} from 'react';
import {Shield,Pencil} from 'lucide-react';
import HeroPortraitMarks from './HeroPortraitMarks';
import {assetUrl,portraitUrl} from './static-data';
import {viewUrl,goTo} from './routes';
import {isWaitlist,waitlistLabel} from './waitlist-types';
type ProfileHero={debut_version?:string|null;release_date?:string|null;release_event?:string|null;id:string;name:string;title:string;category:string;color:string;portrait:string|null;pool:string|null;blessing:string|null;weapon_type?:string|null;move_type?:string|null;heroic_grail?:boolean;demote:boolean;schedule:string;month:string|null;notes:string;updated:string};
const scheduleName=(s:string)=>isWaitlist(s)?waitlistLabel(s):({'General':'General Schedule','Remix':'Remix Schedule','Monthly Revival':'L/M Revival Schedule','Forging Bonds Revival':'NH Revival Schedule','Hall of Forms Revival':'HoF Revival Schedule'}[s]||s);
export default function HeroProfilePage({hero,heroes=[],loading,error,tags,onBack,onEdit,onRemove,busy}:{hero:ProfileHero|null;heroes?:ProfileHero[];loading:boolean;error:string;tags:ReactNode;onBack:()=>void;onEdit?:()=>void;onRemove?:()=>void;busy:boolean}){
 const heading=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{heading.current?.focus({preventScroll:true});},[hero?.id]);
 const month=hero?.month?new Date(hero.month.slice(0,7)+'-01T12:00:00').toLocaleDateString('en-US',{month:'long',year:'numeric'}):'';
 const updated=hero?.updated?new Date(hero.updated):null;
 return <main className="hero-profile-page" aria-labelledby="hero-detail-name">
  <header className="hero-page-heading"><button className="hero-page-back" aria-label="Back to previous page" onClick={onBack}/><span>Hero profile</span></header>
  {hero?<article className="hero-detail-layout">
   <section className="hero-detail-top" aria-label="Hero identity"><div className="hero-detail-portrait">{hero.portrait?<img src={portraitUrl(hero.portrait,'detail')} alt={hero.name+' portrait'}/>:<Shield size={64}/>}<HeroPortraitMarks hero={hero}/></div><div className="hero-detail-identity"><h1 ref={heading} id="hero-detail-name" tabIndex={-1}>{hero.name}</h1>{hero.title&&<p className="hero-detail-title">{hero.title}</p>}<div className="hero-detail-tags">{tags}</div></div></section>
   <div className="hero-profile-scroll" tabIndex={0} role="region" aria-label="Hero profile details">
   {hero.schedule&&hero.schedule!=='None'&&<section className="hero-profile-rerun" aria-labelledby="hero-rerun-heading"><h2 id="hero-rerun-heading">Rerun information</h2><p>{scheduleName(hero.schedule)}</p><strong>{isWaitlist(hero.schedule)?'Awaiting a rerun':month||'Not scheduled yet'}</strong><a href={viewUrl(hero.schedule,hero.month||'')} onClick={e=>{if(!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey){e.preventDefault();goTo(viewUrl(hero.schedule,hero.month||''));}}}>View {isWaitlist(hero.schedule)?'waitlist':'schedule'}</a></section>}
   {isBeta&&<V2HeroInfo hero={hero} heroes={heroes}/>}<dl className="hero-detail-facts">
    <div><dt>Weapon color</dt><dd><img src={assetUrl('weapon-orbs/'+hero.color.toLowerCase()+'.webp')} alt="" width={28} height={28}/>{hero.color}</dd></div>
    <div><dt>Weapon type</dt><dd>{hero.weapon_type?<><img src={assetUrl('weapon-types/'+hero.color.toLowerCase()+'-'+hero.weapon_type.toLowerCase()+'.webp')} alt="" width={28} height={28}/>{hero.weapon_type}</>:'Not assigned'}</dd></div>
    <div><dt>Movement type</dt><dd>{hero.move_type?<><img src={assetUrl('move-types/'+hero.move_type.toLowerCase()+'.webp')} alt="" width={28} height={28}/>{hero.move_type}</>:'Not assigned'}</dd></div>
    <div><dt>Summon availability</dt><dd>{hero.heroic_grail?'Heroic Grails':hero.demote?'4–5★ demote':hero.pool||'Not specified'}</dd></div>
    {hero.blessing&&<div><dt>Blessing</dt><dd>{hero.blessing}</dd></div>}
   </dl>
   <section className="hero-owner-note" aria-labelledby="hero-note-label"><h2 id="hero-note-label">Notes</h2><p>{hero.notes||'No notes added yet.'}</p></section>
   <footer className="hero-detail-bottom">{updated&&!Number.isNaN(updated.getTime())&&<span>Last updated {updated.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'Asia/Bangkok'})}</span>}{onRemove&&<button className="secondary" disabled={busy} onClick={onRemove}>Remove from Waitlist</button>}{onEdit&&<button className="secondary" onClick={onEdit}><Pencil size={16}/>Edit hero</button>}</footer>
   </div>
  </article>:<section className="hero-page-empty"><h1 ref={heading} id="hero-detail-name" tabIndex={-1}>{loading?'Loading hero…':'Hero not found'}</h1><p>{error||(!loading?'This hero link is unavailable. Browse All Heroes to find the current profile.':'')}</p><button className="secondary" onClick={()=>goTo(viewUrl('All Heroes'))}>Browse All Heroes</button></section>}
 </main>;
}
