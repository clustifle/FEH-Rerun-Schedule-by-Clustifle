import {useEffect,useMemo,useRef,useState} from 'react';
import {loadSkillCatalog,skillIdentity,skillSlots,type HeroSkill} from './hero-skills';
import {SkillIcon,skillTypeLabel} from './HeroSkills';
import './HallOfFormsSkills.css';

export function HallOfFormsSkillEditor({value,onChange}:{value:HeroSkill[];onChange:(skills:HeroSkill[])=>void}){
 const [rows,setRows]=useState<HeroSkill[]>([]),[query,setQuery]=useState(''),[slot,setSlot]=useState('All'),[error,setError]=useState(''),[loading,setLoading]=useState(true),[retry,setRetry]=useState(0);
 useEffect(()=>{let live=true;setLoading(true);setError('');loadSkillCatalog().then(data=>{if(live)setRows(data)}).catch(()=>{if(live)setError('Could not load the Skills List.')}).finally(()=>{if(live)setLoading(false)});return()=>{live=false}},[retry]);
 const choices=useMemo(()=>{const unique=new Map<string,HeroSkill>();for(const skill of [...value,...rows])if(!unique.has(skillIdentity(skill)))unique.set(skillIdentity(skill),skill);return [...unique.values()].filter(s=>(slot==='All'||s.slot===slot)&&s.name.toLowerCase().includes(query.trim().toLowerCase())).sort((a,b)=>a.name.localeCompare(b.name));},[rows,value,query,slot]);
 return <div className="hof-skill-editor"><p>Select the skills newly available in this month's Hall of Forms. Add missing skills in the Skills List first.</p><div className="form-row"><label>Find a skill<input type="search" value={query} onChange={e=>setQuery(e.target.value)}/></label><label>Skill type<select value={slot} onChange={e=>setSlot(e.target.value)}><option value="All">All types</option>{skillSlots.map(s=><option key={s}>{s}</option>)}</select></label></div><p role="status">{value.length} skills selected</p>{loading&&<p role="status">Loading skills…</p>}{error&&<p role="alert">{error} <button type="button" onClick={()=>setRetry(n=>n+1)}>Retry</button></p>}<div className="hof-skill-choices">{choices.slice(0,100).map(skill=>{const selected=value.some(s=>skillIdentity(s)===skillIdentity(skill));return <label key={skillIdentity(skill)}><input type="checkbox" checked={selected} onChange={()=>onChange(selected?value.filter(s=>skillIdentity(s)!==skillIdentity(skill)):[...value,skill])}/><SkillIcon skill={skill}/><span>{skill.name}<small>{skillTypeLabel(skill)}</small></span></label>})}{!loading&&!error&&!choices.length&&<p>No matching skills.</p>}</div>{choices.length>100&&<p>Narrow your search to see more skills.</p>}</div>;
}

export default function HallOfFormsSkills({skills,month,onClose}:{skills:HeroSkill[];month:string;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{dialog.current?.showModal()},[]);
 const label=month?new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(month.slice(0,7)+'-01T00:00:00Z')):'';
 return <dialog ref={dialog} className="hof-skills-dialog" aria-labelledby="hof-skills-title" onCancel={e=>{e.preventDefault();onClose()}}><header className="dialog-top"><div><p>Hall of Forms · {label}</p><h2 id="hof-skills-title">Skills added this month</h2></div><button type="button" className="icon-button" aria-label="Close added skills" onClick={onClose}>×</button></header><div className="hof-added-skills">{skills.length?skills.map(skill=><div key={skillIdentity(skill)}><SkillIcon skill={skill}/><span>{skill.name}<small>{skillTypeLabel(skill)}</small></span></div>):<p>This month's added skills have not been listed yet.</p>}</div></dialog>;
}
