import {useEffect,useRef,useState} from 'react';
import {bestSkills,loadHeroSkills,skillSlots,type HeroSkill} from './hero-skills';
import {SkillIcon} from './HeroSkills';
import './HoverHeroSkills.css';
const cache=new Map<string,{expires:number;rows:Promise<HeroSkill[]>}>();
function skills(id:string){const old=cache.get(id);if(old&&old.expires>Date.now())return old.rows;const rows=loadHeroSkills(id).catch(e=>{cache.delete(id);throw e});if(cache.size>=100)cache.clear();cache.set(id,{expires:Date.now()+15000,rows});return rows}
export default function HoverHeroSkills({heroId,attuned}:{heroId:string;attuned:boolean}){
 const [rows,setRows]=useState<HeroSkill[]>([]),[error,setError]=useState(false),root=useRef<HTMLDivElement>(null);
 useEffect(()=>{let live=true;setRows([]);setError(false);skills(heroId).then(rows=>{if(live)setRows(rows)}).catch(()=>{if(live)setError(true)});return()=>{live=false}},[heroId]);
 useEffect(()=>{const popup=root.current?.closest<HTMLElement>('.hero-hover-preview');if(!popup)return;const fit=()=>{const rect=popup.getBoundingClientRect();popup.style.top=Math.max(12,Math.min(rect.top,innerHeight-rect.height-12))+'px'};fit();const observer=new ResizeObserver(fit);observer.observe(popup);return()=>observer.disconnect()},[rows,error]);
 const best=bestSkills(rows);return <div ref={root} className="hover-hero-skills" aria-label="Hero skills">{skillSlots.filter(slot=>slot!=='X'||attuned).flatMap(slot=>best.filter(s=>s.slot===slot).map(s=><div className="hover-hero-skill" key={s.id} aria-label={slot+' skill'}><SkillIcon skill={s}/><span>{s.name}</span></div>))}{error&&<small>Skills unavailable · open hero profile to retry</small>}</div>
}
