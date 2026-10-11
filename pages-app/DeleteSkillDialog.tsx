import {useEffect,useRef,useState} from 'react';
import {supabase} from './static-data';
import type {HeroSkill} from './hero-skills';

export default function DeleteSkillDialog({records,recordLabel,onClose,onDeleted}:{records:HeroSkill[];recordLabel:(skill:HeroSkill)=>string;onClose:()=>void;onDeleted:(id:string)=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 const [id,setId]=useState(records[0].id),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const skill=records.find(s=>s.id===id)!;
 useEffect(()=>{dialog.current?.showModal()},[]);
 async function remove(){
  if(busy)return;
  setBusy(true);setError('');
  try{
   const {data,error}=await supabase.from('tracker_hero_skills').delete().eq('id',skill.id).eq('revision',skill.revision).select('id');
   if(error)throw Error(error.message);
   if(!data?.length)throw Error('This skill changed or could not be deleted. Reload Skills List and try again.');
   onDeleted(skill.id);
  }catch(e){setError(e instanceof Error?e.message:'Could not delete skill.');setBusy(false)}
 }
 return <dialog ref={dialog} className="hero-editor skills-catalog-editor skill-delete-dialog" aria-labelledby="delete-skill-title" onCancel={e=>{e.preventDefault();if(!busy)onClose()}}>
  <form onSubmit={e=>{e.preventDefault();void remove()}}>
   <div className="dialog-top"><h2 id="delete-skill-title">Delete skill</h2><button type="button" className="secondary" disabled={busy} onClick={onClose} aria-label="Close delete skill">×</button></div>
   <div className="editor-body"><div className="editor-fields">
    <p>Delete <strong>{skill.name}</strong>?</p>
    <label>Skill record<select aria-label="Skill record to delete" disabled={busy} value={id} onChange={e=>setId(e.target.value)}>{records.map(s=><option key={s.id} value={s.id}>{recordLabel(s)}</option>)}</select></label>
    <p>{skill.hero_id?'This removes the skill from this unit’s profile.':'This removes the shared Skills List record.'} This cannot be undone.</p>
    {error&&<p role="alert">{error}</p>}
    <div className="skills-directory-actions"><button type="button" className="secondary" disabled={busy} onClick={onClose}>Cancel</button><button type="submit" className="secondary skill-delete-button" disabled={busy}>{busy?'Deleting…':'Delete skill permanently'}</button></div>
   </div></div>
  </form>
 </dialog>
}
