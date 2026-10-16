import {useEffect,useMemo,useRef,useState} from 'react';
import {loadSkillCatalog,skillIdentity,type HeroSkill} from './hero-skills';
import {SkillIcon} from './HeroSkills';
import SkillBrowser from './SkillBrowser';
import {X} from 'lucide-react';
import './HallOfFormsSkills.css';

export function HallOfFormsSkillEditor({value,onChange}:{value:HeroSkill[];onChange:(skills:HeroSkill[])=>void}){
 const [rows,setRows]=useState<HeroSkill[]>([]),[error,setError]=useState(''),[loading,setLoading]=useState(true),[retry,setRetry]=useState(0);
 useEffect(()=>{let live=true;setLoading(true);setError('');loadSkillCatalog().then(data=>{if(live)setRows(data)}).catch(()=>{if(live)setError('Could not load the Skills List.')}).finally(()=>{if(live)setLoading(false)});return()=>{live=false}},[retry]);
 const choices=useMemo(()=>[...value,...rows],[rows,value]);
 function toggle(skill:HeroSkill){const key=skillIdentity(skill);setError('');if(value.some(s=>skillIdentity(s)===key))onChange(value.filter(s=>skillIdentity(s)!==key));else if(value.length<200)onChange([...value,skill]);else setError('Select up to 200 monthly skills. Remove a skill before adding another.');}
 return <div className="hof-skill-editor"><p className="hof-editor-help">Select this month's newly available skills. Your selection stays visible as you search.</p><details className="hof-selected-skills" open><summary>Monthly selection <span>{value.length}</span></summary>{value.length?<div className="hof-selected-list">{value.map(skill=><button type="button" key={skillIdentity(skill)} aria-label={'Remove '+skill.name+' from monthly skills'} onClick={()=>toggle(skill)}><SkillIcon skill={skill}/><span>{skill.name}</span><X size={14}/></button>)}</div>:<p>No skills selected yet.</p>}</details>{error&&<p role="alert">{error}{!rows.length&&<button type="button" className="secondary" onClick={()=>setRetry(n=>n+1)}>Retry</button>}</p>}{loading&&<p role="status">Loading skills…</p>}<div className="hof-catalog-search"><SkillBrowser skills={choices} selected={value} multiple picker onChoose={toggle}/></div><p className="hof-editor-help">Missing a skill? Add it in Skills List, then <button type="button" disabled={loading} onClick={()=>setRetry(n=>n+1)}>refresh the catalog</button>.</p></div>;

}

export default function HallOfFormsSkills({skills,month,onClose}:{skills:HeroSkill[];month:string;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{dialog.current?.showModal()},[]);
 const date=new Date(month.slice(0,7)+'-01T00:00:00Z'),label=Number.isFinite(date.getTime())?new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric',timeZone:'UTC'}).format(date):'Monthly update';
 return <dialog ref={dialog} className="hof-skills-dialog" aria-labelledby="hof-skills-title" onCancel={e=>{e.preventDefault();onClose()}}><header className="dialog-top"><div><p className="hof-dialog-eyebrow">Hall of Forms <span>· {label}</span></p><h2 id="hof-skills-title">Skills added this month</h2></div><button type="button" className="icon-button" aria-label="Close added skills" onClick={onClose}><X size={20}/></button></header><div className="hof-added-skills">{skills.length?<SkillBrowser skills={skills} readOnly/>:<div className="hof-skills-empty"><h3>Skills to be announced</h3><p>This month's added skills have not been listed yet.</p></div>}</div><div className="hof-skills-footer" role="group" aria-label="Monthly skills actions"><button type="button" className="secondary" onClick={onClose}>Close</button></div></dialog>;
}
