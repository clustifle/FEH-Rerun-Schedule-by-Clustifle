import {useEffect,useState} from 'react';
import {assetUrl} from './static-data';
import {bestSkills,loadHeroSkills,skillSlots,slotIcons,type HeroSkill} from './hero-skills';
import './HeroSkills.css';

export default function HeroSkills({heroId,attuned=false,canEdit=false}:{heroId:string;attuned?:boolean;canEdit?:boolean}){

 const [rows,setRows]=useState<HeroSkill[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 useEffect(()=>{let live=true;setLoading(true);setError('');loadHeroSkills(heroId).then(r=>{if(live)setRows(r)}).catch(e=>{if(live)setError(e.message)}).finally(()=>{if(live)setLoading(false)});return()=>{live=false}},[heroId,retry]);
 if(loading)return <p role="status">Loading skills…</p>;if(error)return <div role="alert">{error}<button onClick={()=>setRetry(n=>n+1)}>Retry</button></div>;
 const best=bestSkills(rows);
 return <section className="hero-skills hero-skills-section hero-skill-group" aria-label="Hero skills">{skillSlots.filter(slot=>(slot!=="X"||attuned)&&(canEdit||best.some(s=>s.slot===slot))).map(slot=><div key={slot} className="hero-skill-slot" aria-label={slot+' skill slot'}>{best.some(s=>s.slot===slot)?best.filter(s=>s.slot===slot).map(s=><div key={s.id} className="hero-skill-summary"><SkillIcon skill={s}/><div><h3>{s.name}</h3></div></div>):<div className="skill-empty" aria-label={slot+' not recorded'}>{['A','B','C','X'].includes(slot)?<PassiveIcon slot={slot as 'A'|'B'|'C'|'X'}/>:<img src={assetUrl('skill-slots/'+slotIcons[slot]+'.png')} alt=""/>}<span>Not recorded</span></div>}</div>)}</section>
}
function PassiveIcon({slot,url}:{slot:'A'|'B'|'C'|'X';url?:string|null}){return <span className="passive-icon">{!url&&<img className="passive-disc" src={assetUrl('skill-slots/passive-empty.png')} alt=""/>}{url&&<img className="passive-art" src={url} alt=""/>}<img className="passive-letter" src={assetUrl('skill-slots/'+slotIcons[slot]+'.png')} alt={slot+' slot'}/></span>}
export function SkillIcon({skill:s}:{skill:HeroSkill}){return <>{['A','B','C','X'].includes(s.slot)?<PassiveIcon slot={s.slot as 'A'|'B'|'C'|'X'} url={s.icon_url}/>:<img src={(s.refined?s.icon_url:null)||assetUrl('skill-slots/'+slotIcons[s.slot]+'.png')} alt=""/>}</>}
export function skillTypeLabel(s:HeroSkill){return s.slot==='Weapon'?(s.refined?'Weapon · Refined':'Weapon'):s.slot==='Assist'?'Assist':s.slot==='Special'?'Special':'Passive '+s.slot}
export function Skill({skill:s}:{skill:HeroSkill}){return <article className="hero-skill" aria-labelledby={'skill-name-'+s.id}><div className="hero-skill-name"><SkillIcon skill={s}/><div className="hero-skill-heading"><div><h3 id={'skill-name-'+s.id}>{s.name}</h3></div></div></div></article>}
