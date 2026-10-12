import {useEffect,useRef} from 'react';
import {Skill} from './HeroSkills';
import './SkillsList.css';
import type {HeroSkill} from './hero-skills';

export default function SkillDetailsDialog<T extends {id:string;name:string;title:string}>({skill,heroes,onClose,onView,onEdit,onDelete}:{skill:HeroSkill;heroes:T[];onClose:()=>void;onView:(hero:T)=>void;onEdit?:()=>void;onDelete?:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{dialog.current?.showModal()},[]);
 return <dialog ref={dialog} className="skill-details-dialog skill-preview-dialog" aria-labelledby={'skill-name-'+skill.id} onCancel={e=>{e.preventDefault();onClose()}} onClick={e=>{if(e.target===e.currentTarget){const rect=e.currentTarget.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)onClose()}}}>
  <div className="skill-preview-header"><div className="hero-skills"><Skill skill={skill}/></div><button className="secondary" type="button" aria-label="Close skill details" onClick={onClose}>×</button></div>
  {!!heroes.length&&<section className="skill-preview-units"><h4>Heroes with this skill</h4><div className="skills-directory-heroes" aria-label="Units with this skill">{heroes.map(hero=><button className="secondary" key={hero.id} onClick={()=>onView(hero)}>{hero.name}{hero.title?' · '+hero.title:''}</button>)}</div></section>}
  {(onEdit||onDelete)&&<footer className="skills-directory-actions">{onEdit&&<button className="secondary" onClick={onEdit}>Edit skill</button>}{onDelete&&<button className="secondary skill-delete-button" onClick={onDelete}>Delete skill</button>}</footer>}
 </dialog>
}
