import WikiHeroImport from './WikiHeroImport';
import AdminHeroSkills from './AdminHeroSkills';
import HeroSkills from './HeroSkills';
import {isBeta} from './beta';
import './HeroProfilePage.css';
import {V2HeroInfo} from './V2Workspace';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import {Shield,Pencil} from 'lucide-react';
import HeroPortraitMarks from './HeroPortraitMarks';
import {assetUrl,portraitUrl} from './static-data';
import {viewUrl,goTo} from './routes';
import {isWaitlist,waitlistLabel} from './waitlist-types';
type ProfileHero={debut_version?:string|null;release_date?:string|null;release_event?:string|null;id:string;name:string;title:string;category:string;color:string;portrait:string|null;pool:string|null;blessing:string|null;weapon_type?:string|null;move_type?:string|null;heroic_grail?:boolean;demote:boolean;schedule:string;month:string|null;notes:string;updated:string};
const scheduleName=(s:string)=>isWaitlist(s)?waitlistLabel(s):({'General':'General Schedule','Remix':'Remix Schedule','Monthly Revival':'L/M Revival Schedule','Forging Bonds Revival':'NH Revival Schedule','Hall of Forms Revival':'HoF Revival Schedule'}[s]||s);
export default function HeroProfilePage({hero,heroes=[],loading,error,tags,onBack,onEdit,onRemove,busy,onRefresh}:{hero:ProfileHero|null;heroes?:ProfileHero[];loading:boolean;error:string;tags:ReactNode;onBack:()=>void;onEdit?:()=>void;onRemove?:()=>void;busy:boolean;onRefresh?:()=>void}){
 const [wikiImport,setWikiImport]=useState(false);
 const skillsDialog=useRef<HTMLDialogElement>(null);const [skillsEditing,setSkillsEditing]=useState(false),[skillsSaving,setSkillsSaving]=useState(false),[skillsRevision,setSkillsRevision]=useState(0);useEffect(()=>{if(skillsEditing)skillsDialog.current?.showModal();else skillsDialog.current?.close()},[skillsEditing]);
 const [tab,setTab]=useState('Overview');const scroll=useRef<HTMLDivElement>(null);
 const heading=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{setTab('Overview');setSkillsEditing(false);setWikiImport(false);heading.current?.focus({preventScroll:true});},[hero?.id]);
 const month=hero?.month?new Date(hero.month.slice(0,7)+'-01T12:00:00').toLocaleDateString('en-US',{month:'long',year:'numeric'}):'';
 const updated=hero?.updated?new Date(hero.updated):null;
 return <main className="hero-profile-page" aria-labelledby="hero-detail-name">
  <header className="hero-page-heading"><button className="hero-page-back" aria-label="Back to previous page" onClick={onBack}/><span>Hero profile</span></header>
  {hero?<article className="hero-detail-layout">
   <section className="hero-detail-top" aria-label="Hero identity"><div className="hero-detail-portrait">{hero.portrait?<img src={portraitUrl(hero.portrait,'detail')} alt={hero.name+' portrait'}/>:<Shield size={64}/>}<HeroPortraitMarks hero={hero}/></div><div className="hero-detail-identity"><h1 ref={heading} id="hero-detail-name" tabIndex={-1}>{hero.name}</h1>{hero.title&&<p className="hero-detail-title">{hero.title}</p>}<div className="hero-detail-tags">{tags}</div></div></section>
   <div className="hero-profile-content"><nav className="hero-profile-tabs" role="tablist" aria-label="Hero profile sections">{['Overview','Skills'].map((name,i)=><button className="secondary" key={name} id={'hero-tab-'+name} role="tab" aria-selected={tab===name} tabIndex={tab===name?0:-1} aria-controls={'hero-panel-'+name} onClick={()=>{setTab(name);if(scroll.current)scroll.current.scrollTop=0}} onKeyDown={e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=['Overview','Skills'][e.key==='Home'?0:e.key==='End'?1:1-i];setTab(next);document.getElementById('hero-tab-'+next)?.focus();if(scroll.current)scroll.current.scrollTop=0}}}>{name}</button>)}</nav>{onEdit&&!isBeta&&<div className="hero-profile-import-action"><button className="secondary" onClick={()=>setWikiImport(true)}>Import from FEH Wiki</button></div>}<div ref={scroll} className="hero-profile-scroll" tabIndex={0} role="region" aria-label="Hero profile details"><div className="hero-overview-panel" role="tabpanel" id="hero-panel-Overview" aria-labelledby="hero-tab-Overview" hidden={tab!=='Overview'}>
   {hero.schedule&&hero.schedule!=='None'&&<section className="hero-profile-rerun" aria-labelledby="hero-rerun-heading"><h2 id="hero-rerun-heading">Rerun information</h2><p>{scheduleName(hero.schedule)}</p><strong>{isWaitlist(hero.schedule)?'Awaiting a rerun':month||'Not scheduled yet'}</strong><a href={viewUrl(hero.schedule,hero.month||'')} onClick={e=>{if(!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey){e.preventDefault();goTo(viewUrl(hero.schedule,hero.month||''));}}}>View {isWaitlist(hero.schedule)&&hero.schedule!=='Schedule Under Consideration'?'waitlist':'schedule'}</a></section>}
   {<V2HeroInfo hero={hero} heroes={heroes}/>}<dl className="hero-detail-facts">
    <div><dt>Weapon color</dt><dd><img src={assetUrl('weapon-orbs/'+hero.color.toLowerCase()+'.webp')} alt="" width={28} height={28}/>{hero.color}</dd></div>
    <div><dt>Weapon type</dt><dd>{hero.weapon_type?<><img src={assetUrl('weapon-types/'+hero.color.toLowerCase()+'-'+hero.weapon_type.toLowerCase()+'.webp')} alt="" width={28} height={28}/>{hero.weapon_type}</>:'Not assigned'}</dd></div>
    <div><dt>Movement type</dt><dd>{hero.move_type?<><img src={assetUrl('move-types/'+hero.move_type.toLowerCase()+'.webp')} alt="" width={28} height={28}/>{hero.move_type}</>:'Not assigned'}</dd></div>
    <div><dt>Summon availability</dt><dd>{hero.heroic_grail?'Heroic Grails':hero.demote?'4–5★ demote':hero.pool||'Not specified'}</dd></div>
    {hero.blessing&&<div><dt>Blessing</dt><dd>{hero.blessing}</dd></div>}
   </dl>
   <section className="hero-owner-note" aria-labelledby="hero-note-label"><h2 id="hero-note-label">Notes</h2><p>{hero.notes||'No notes added yet.'}</p></section>
   <footer className="hero-detail-bottom">{onEdit&&!isBeta&&<button className="secondary" onClick={()=>setSkillsEditing(true)}>Edit Skills on this unit</button>}{updated&&!Number.isNaN(updated.getTime())&&<span>Last updated {updated.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'Asia/Bangkok'})}</span>}{onRemove&&<button className="secondary" disabled={busy} onClick={onRemove}>Remove from Waitlist</button>}{onEdit&&<button className="secondary" onClick={onEdit}><Pencil size={16}/>Edit hero</button>}</footer>
   </div><div role="tabpanel" id="hero-panel-Skills" aria-labelledby="hero-tab-Skills" hidden={tab!=='Skills'}>{onEdit&&!isBeta&&<button className="secondary unit-skills-edit" onClick={()=>setSkillsEditing(true)}>Edit Skills on this unit</button>}{tab==='Skills'&&<HeroSkills key={skillsRevision} heroId={hero.id} attuned={hero.category==="Attuned"} canEdit={!!onEdit}/>}</div></div></div>
  </article>:<section className="hero-page-empty"><h1 ref={heading} id="hero-detail-name" tabIndex={-1}>{loading?'Loading hero…':'Hero not found'}</h1><p>{error||(!loading?'This hero link is unavailable. Browse All Heroes to find the current profile.':'')}</p><button className="secondary" onClick={()=>goTo(viewUrl('All Heroes'))}>Browse All Heroes</button></section>}
 {hero&&onEdit&&!isBeta&&wikiImport&&<WikiHeroImport hero={hero} onClose={()=>setWikiImport(false)} onSaved={()=>{setSkillsRevision(n=>n+1);onRefresh?.();}}/>}
 {hero&&onEdit&&!isBeta&&<dialog className="hero-editor unit-skills-editor" ref={skillsDialog} aria-labelledby="unit-skills-title" onCancel={e=>{e.preventDefault();if(!skillsSaving)setSkillsEditing(false)}}><form onSubmit={e=>e.preventDefault()}><div className="dialog-top"><h2 id="unit-skills-title">Edit Skills · {hero.name}</h2><button className="secondary" type="button" disabled={skillsSaving} onClick={()=>setSkillsEditing(false)} aria-label="Close unit skills editor">×</button></div><div className="editor-body"><div className="editor-fields">{skillsEditing&&<AdminHeroSkills site heroId={hero.id} onBusyChange={setSkillsSaving} onSaved={()=>setSkillsRevision(n=>n+1)}/>}</div></div></form></dialog>}</main>;
}
