import {displayPool,specialRatePools,isStarterHero} from './hero-pools';
import {heroOrigin,originGames} from './hero-origins';
import {blessingIcon} from './blessing-icons';
const WikiHeroImport=lazy(()=>import('./WikiHeroImport'));
import AdminHeroSkills from './AdminHeroSkills';
import HeroSkills from './HeroSkills';
import {isBeta} from './beta';
import './HeroProfilePage.css';
import {V2HeroInfo,HeroWatchlist} from './V2Workspace';
import {useEffect,useRef,useState,lazy,Suspense,type ReactNode} from 'react';
import {Shield,Pencil,ArrowUpRight,Download} from 'lucide-react';
import {assetUrl,portraitUrl} from './static-data';
import {viewUrl,goTo} from './routes';
import {isWaitlist,waitlistLabel} from './waitlist-types';
type ProfileHero={debut_version?:string|null;release_date?:string|null;release_event?:string|null;id:string;name:string;title:string;category:string;color:string;portrait:string|null;pool:string|null;blessing:string|null;weapon_type?:string|null;move_type?:string|null;heroic_grail?:boolean;demote:boolean;schedule:string;month:string|null;notes:string;updated:string};
const scheduleName=(s:string)=>isWaitlist(s)?waitlistLabel(s):({'General':'General Schedule','Remix':'Remix Schedule','Monthly Revival':'L/M Revival Schedule','Forging Bonds Revival':'NH Revival Schedule','Hall of Forms Revival':'HoF Revival Schedule'}[s]||s);
export default function HeroProfilePage({hero,heroes=[],loading,error,tags,onBack,onEdit,onRemove,busy,onRefresh}:{hero:ProfileHero|null;heroes?:ProfileHero[];loading:boolean;error:string;tags:ReactNode;onBack:()=>void;onEdit?:()=>void;onRemove?:()=>void;busy:boolean;onRefresh?:()=>void}){
 const [wikiImport,setWikiImport]=useState(false);
 const skillsDialog=useRef<HTMLDialogElement>(null);const [skillsEditing,setSkillsEditing]=useState(false),[skillsSaving,setSkillsSaving]=useState(false),[skillsRevision,setSkillsRevision]=useState(0);useEffect(()=>{if(skillsEditing)skillsDialog.current?.showModal();else skillsDialog.current?.close()},[skillsEditing]);
 const heading=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{setSkillsEditing(false);setWikiImport(false);heading.current?.focus({preventScroll:true});},[hero?.id]);
 const month=hero?.month?new Date(hero.month.slice(0,7)+'-01T12:00:00').toLocaleDateString('en-US',{month:'long',year:'numeric'}):'';
 const updated=hero?.updated?new Date(hero.updated):null;
 return <main className="hero-profile-page" aria-labelledby="hero-detail-name">
  <header className="hero-page-heading"><button className="hero-page-back" aria-label="Back to previous page" onClick={onBack}/><span>Hero profile</span></header>
  {hero?<article className="hero-detail-layout">
   <section className="hero-detail-top" aria-label="Hero identity"><div className="hero-detail-portrait">{hero.portrait?<img src={portraitUrl(hero.portrait,'detail')} alt={hero.name+' portrait'}/>:<Shield size={64}/>}<span className="portrait-marks" aria-hidden="true"><span className={'hero-portrait-frame frame-'+hero.color.toLowerCase()} data-frame-color={hero.color.toLowerCase()}/></span></div><div className="hero-detail-identity"><h1 ref={heading} id="hero-detail-name" tabIndex={-1}>{hero.name}</h1>{hero.title&&<p className="hero-detail-title">{hero.title}</p>}</div></section>
   <div className="hero-profile-content">
    {onEdit&&<div className="hero-profile-actions" aria-label="Hero management">
     {!isBeta&&<button className="secondary" onClick={()=>setWikiImport(true)}><Download size={16} aria-hidden="true"/>Import from FEH Wiki</button>}
     <button className="secondary" onClick={onEdit}><Pencil size={16} aria-hidden="true"/>Edit hero</button>
     {onRemove&&<button className="secondary" disabled={busy} onClick={onRemove}>Remove from Waitlist</button>}
    </div>}
    <div className="hero-profile-scroll" tabIndex={0} role="region" aria-label="Hero profile details">
     <div className="hero-profile-summary-grid">
      <section className="hero-profile-overview hero-profile-card" aria-labelledby="hero-overview-heading">
       <header className="hero-profile-card-heading"><h2 id="hero-overview-heading">Overview</h2></header>
       {hero.schedule&&hero.schedule!=='None'&&<div className="hero-profile-rerun" aria-labelledby="hero-rerun-heading">
        <h3 id="hero-rerun-heading">Rerun information</h3><p>{scheduleName(hero.schedule)}</p>
        <strong>{isWaitlist(hero.schedule)?'Awaiting a rerun':month||'Not scheduled yet'}</strong>
        <a href={viewUrl(hero.schedule,hero.month||'')} onClick={e=>{if(!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey){e.preventDefault();goTo(viewUrl(hero.schedule,hero.month||''));}}}>View {isWaitlist(hero.schedule)&&hero.schedule!=='Schedule Under Consideration'?'waitlist':'schedule'}<ArrowUpRight size={14} aria-hidden="true"/></a>
       </div>}
       <dl className="hero-detail-facts"><div><dt>Game origin</dt><dd className="hero-profile-origins">{heroOrigin(hero)?.origins.length?[...new Set(heroOrigin(hero)!.origins)].map(id=>{const game=originGames[id];return <span key={id}><img src={assetUrl('images/game-origins/'+game.file)} alt="" width={28} height={28}/>{game.name}</span>}):'Not recorded'}</dd></div><div><dt>Debut version</dt><dd>{hero.debut_version||'Not recorded'}</dd></div><div><dt>Release date</dt><dd>{hero.release_date||'Not recorded'}</dd></div><div><dt>Hero type</dt><dd>{hero.category==='Chosen Hero'?'Chosen':hero.category}</dd></div>
        <div><dt>Weapon type</dt><dd>{hero.weapon_type?<><img src={assetUrl('weapon-types/'+hero.color.toLowerCase()+'-'+hero.weapon_type.toLowerCase()+'.webp')} alt="" width={24} height={24}/>{hero.color} {hero.weapon_type}</>:<><img src={assetUrl('weapon-orbs/'+hero.color.toLowerCase()+'.webp')} alt="" width={24} height={24}/>{hero.color} · Not assigned</>}</dd></div>
        <div><dt>Movement type</dt><dd>{hero.move_type?<><img src={assetUrl('move-types/'+hero.move_type.toLowerCase()+'.webp')} alt="" width={24} height={24}/>{hero.move_type}</>:'Not assigned'}</dd></div>
        <div><dt>Summon availability</dt><dd>{isStarterHero(hero)?displayPool(hero):hero.heroic_grail?'Heroic Grails':specialRatePools.includes(displayPool(hero))?displayPool(hero):hero.demote?'4–5★ demote':displayPool(hero)}</dd></div>
        {['Legendary','Mythic','Chosen Hero'].includes(hero.category)&&<div><dt>Blessing</dt><dd>{hero.blessing?<><img src={blessingIcon(hero.category,hero.blessing,hero)} alt="" width={24} height={24}/>{hero.blessing}</>:'Not assigned'}</dd></div>}
       </dl>
       <HeroWatchlist hero={hero}/><div className="hero-owner-note" aria-labelledby="hero-note-label"><h3 id="hero-note-label">Notes</h3><p>{hero.notes||'No notes added yet.'}</p></div>
      </section>
      <section className="hero-profile-skills-card hero-profile-card" aria-labelledby="hero-skills-heading">
       <header className="hero-profile-card-heading"><h2 id="hero-skills-heading">Skills</h2>{onEdit&&!isBeta&&<button className="secondary" aria-label="Edit Skills on this unit" onClick={()=>setSkillsEditing(true)}><Pencil size={14} aria-hidden="true"/>Edit skills</button>}</header>
       <HeroSkills key={hero.id+'-'+skillsRevision} heroId={hero.id} attuned={hero.category==="Attuned"} canEdit={!!onEdit}/>
      </section>
     </div>
     <V2HeroInfo hero={hero} heroes={heroes} compact/>
     <footer className="hero-detail-bottom">{updated&&!Number.isNaN(updated.getTime())&&<span>Last updated {updated.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'Asia/Bangkok'})}</span>}{!onEdit&&onRemove&&<button className="secondary" disabled={busy} onClick={onRemove}>Remove from Waitlist</button>}</footer>
    </div>
   </div>
  </article>:<section className="hero-page-empty"><h1 ref={heading} id="hero-detail-name" tabIndex={-1}>{loading?'Loading hero…':'Hero not found'}</h1><p>{error||(!loading?'This hero link is unavailable. Browse All Heroes to find the current profile.':'')}</p><button className="secondary" onClick={()=>goTo(viewUrl('All Heroes'))}>Browse All Heroes</button></section>}
 {hero&&onEdit&&!isBeta&&wikiImport&&<Suspense fallback={<p className="quality-loading" role="status">Loading…</p>}><WikiHeroImport hero={hero} onClose={()=>setWikiImport(false)} onSaved={()=>{setSkillsRevision(n=>n+1);onRefresh?.();}}/></Suspense>}
 {hero&&onEdit&&!isBeta&&<dialog className="hero-editor unit-skills-editor" ref={skillsDialog} aria-labelledby="unit-skills-title" onCancel={e=>{e.preventDefault();if(!skillsSaving)setSkillsEditing(false)}}><form onSubmit={e=>e.preventDefault()}><div className="dialog-top"><h2 id="unit-skills-title">Edit Skills · {hero.name}</h2><button className="secondary" type="button" disabled={skillsSaving} onClick={()=>setSkillsEditing(false)} aria-label="Close unit skills editor">×</button></div><div className="editor-body"><div className="editor-fields">{skillsEditing&&<AdminHeroSkills site heroId={hero.id} onBusyChange={setSkillsSaving} onSaved={()=>setSkillsRevision(n=>n+1)}/>}</div></div></form></dialog>}</main>;
}
