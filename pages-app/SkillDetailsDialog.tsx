import {useEffect,useRef} from 'react';
import {Skill} from './HeroSkills';
import './SkillsList.css';
import type {HeroSkill} from './hero-skills';

export default function SkillDetailsDialog<T extends {id:string;name:string;title:string}>({skill,heroes,onClose,onView,onEdit,onDelete}:{skill:HeroSkill;heroes:T[];onClose:()=>void;onView:(hero:T)=>void;onEdit?:()=>void;onDelete?:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{dialog.current?.showModal()},[]);
 return <dialog ref={dialog} className="hero-editor skills-catalog-editor skill-details-dialog" aria-labelledby={'skill-name-'+skill.id} onCancel={e=>{e.preventDefault();onClose()}}>
  <div className="dialog-top"><span>Skill details</span><button className="secondary" type="button" aria-label="Close skill details" onClick={onClose}>×</button></div>
  <div className="editor-body"><div className="editor-fields"><div className="hero-skills"><Skill skill={skill}/></div>
   {(onEdit||onDelete)&&<div className="skills-directory-actions">{onEdit&&<button className="secondary" onClick={onEdit}>Edit skill</button>}{onDelete&&<button className="secondary skill-delete-button" onClick={onDelete}>Delete skill</button>}</div>}
   {!!heroes.length&&<div className="skills-directory-heroes" aria-label="Units with this skill">{heroes.map(hero=><button className="secondary" key={hero.id} onClick={()=>onView(hero)}>{hero.name}{hero.title?' · '+hero.title:''}</button>)}</div>}
  </div></div>
 </dialog>
}
