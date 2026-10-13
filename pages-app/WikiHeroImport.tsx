import {useEffect,useRef,useState} from 'react';
import {supabase} from './static-data';
import {loadHeroSkills,type HeroSkill} from './hero-skills';
import {fetchWikiHero,wikiMatch,downloadWikiSkillIcon,type WikiHero} from './wiki-hero-import';
import {importHeroPortrait,uploadCommunityImage} from './community-api';
import type {BetaHero} from './V2Workspace';
import './WikiHeroImport.css';
export default function WikiHeroImport({hero,onClose,onSaved}:{hero:BetaHero;onClose:()=>void;onSaved:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 const [url,setUrl]=useState('https://feheroes.fandom.com/wiki/'+encodeURIComponent((hero.name.replace(/\s*\([MF]\)/g,'')+': '+hero.title).replace(/ /g,'_'))),[preview,setPreview]=useState<WikiHero|null>(null),[current,setCurrent]=useState<BetaHero>(hero),[existing,setExisting]=useState<HeroSkill[]>([]),[versions,setVersions]=useState<string[]>([]),[chosen,setChosen]=useState<Set<string>>(new Set()),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 useEffect(()=>{dialog.current?.showModal();},[]);
 const key=(slot:string,name:string)=>slot+'|'+name.trim().toLowerCase();
 async function review(){setBusy(true);setError('');setPreview(null);setNotice('');try{
  const [wiki,skills,record,versionRows]=await Promise.all([fetchWikiHero(url),loadHeroSkills(hero.id),supabase.from('heroes').select('*').eq('id',hero.id).single(),supabase.from('tracker_feh_versions').select('version')]);
  if(record.error)throw record.error;if(versionRows.error)throw versionRows.error;
  if(!wikiMatch(wiki.title,hero.name+': '+hero.title))throw Error('This wiki page is a different hero or variant. Check the name and title.');
  const saved=record.data as BetaHero;setCurrent(saved);setExisting(skills);setVersions((versionRows.data||[]).map(v=>v.version));
  const selected=new Set<string>();if(!saved.debut_version&&wiki.version&&versionRows.data?.some(v=>v.version===wiki.version))selected.add('version');if(!saved.release_date&&wiki.releaseDate)selected.add('date');
  for(const skill of wiki.skills)if(!skills.some(s=>key(s.slot,s.name)===key(skill.slot,skill.name))&&(skill.slot!=='X'||hero.category.toLowerCase().includes('attuned'))&&(!['A','B','C','X'].includes(skill.slot)||skill.icon))selected.add(key(skill.slot,skill.name));
  setChosen(selected);setPreview(wiki);
 }catch(e){setError(e instanceof Error?e.message:'Could not preview this wiki page.');}finally{setBusy(false);}}
 function toggle(id:string){setChosen(old=>{const next=new Set(old);next.has(id)?next.delete(id):next.add(id);return next;});}
 async function merge(){if(!preview||!chosen.size||busy)return;setBusy(true);setError('');setNotice('');let releaseSaved=false;try{
  const [record,skills]=await Promise.all([supabase.from('heroes').select('*').eq('id',hero.id).single(),loadHeroSkills(hero.id)]);if(record.error)throw record.error;if(record.data.revision!==current.revision)throw Error('This hero changed after the preview. Preview the wiki page again.');
  const additions=preview.skills.filter(s=>chosen.has(key(s.slot,s.name))&&!skills.some(old=>key(old.slot,old.name)===key(s.slot,s.name)));
  const changes={...(chosen.has('version')?{debut_version:preview.version}:{}),...(chosen.has('date')?{release_date:preview.releaseDate}:{})};
  if(Object.keys(changes).length){const {error}=await supabase.rpc('tracker_v2_save_heroes',{records:[{id:hero.id,revision:current.revision,...changes}]});if(error)throw error;releaseSaved=true;}
  const records=[],failed:string[]=[],failedKeys=new Set<string>();
  for(const s of additions){let icon_url=null;
   if(['A','B','C','X'].includes(s.slot)){
    try{if(!s.icon)throw Error('No wiki icon');let file;try{file=await downloadWikiSkillIcon(s);}catch{file=await importHeroPortrait(s.icon);}icon_url=await uploadCommunityImage(file,'hero');}
    catch{failed.push(s.name);failedKeys.add(key(s.slot,s.name));continue;}
   }
   records.push({id:crypto.randomUUID(),hero_id:hero.id,slot:s.slot,name:s.name,family:s.name.replace(/\s+[1-4]$/,''),tier:null,description:'',refined:false,arcane:false,icon_url,remix:false,sp:null,rarity:'',prerequisites:'',restrictions:'',exclusive:false,inherit_moves:[],inherit_weapons:[],source_url:preview.url,revision:1});
  }
  if(records.length){const {error}=await supabase.from('tracker_hero_skills').insert(records);if(error)throw error;}
  setNotice((releaseSaved?'Release info saved. ':'')+records.length+' new skills added. Existing skills were kept.');
  if(failed.length){setError('Could not import icons for: '+failed.join(', ')+'. These skills remain selected. Retry the merge or upload their icons manually.');setChosen(failedKeys);setExisting([...skills,...records] as HeroSkill[]);
   if(releaseSaved){const latest=await supabase.from('heroes').select('*').eq('id',hero.id).single();if(!latest.error)setCurrent(latest.data as BetaHero);}
  }else{setPreview(null);setChosen(new Set());}if(releaseSaved||records.length)onSaved();
 }catch(e){setError((releaseSaved?'Release details were saved, but skills were not merged. Preview again to finish. ':'')+(e instanceof Error?e.message:'Could not merge selected info.'));if(releaseSaved)onSaved();}finally{setBusy(false);}}
 return <dialog ref={dialog} className="wiki-hero-import" aria-labelledby="wiki-import-title" onCancel={e=>{e.preventDefault();if(!busy)onClose();}}><header><h3 id="wiki-import-title">Import from FEH Wiki</h3><button disabled={busy} aria-label="Close wiki import" onClick={onClose}>×</button></header><p>{hero.name} · {hero.title}</p><form onSubmit={e=>{e.preventDefault();void review();}}><label>Hero wiki page URL<input type="url" required value={url} disabled={busy} onChange={e=>{setUrl(e.target.value);setPreview(null);}}/></label><button disabled={busy}>{busy?'Working…':'Preview wiki info'}</button></form>{error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}{preview&&<><a href={preview.url} target="_blank" rel="noopener noreferrer">Check source: {preview.title}</a><p>Choose the fields to merge. Existing skills are kept; identical skills are skipped. Refines and PRF settings remain manual.</p><div className="wiki-import-comparison">{[['version','Debut version',current.debut_version,preview.version],['date','Release date',current.release_date,preview.releaseDate]].map(([id,label,old,next])=><label key={id}><input type="checkbox" disabled={busy||!next||(id==='version'&&!versions.includes(next))||old===next} checked={chosen.has(id!)} onChange={()=>toggle(id!)}/><span><strong>{label}</strong><small>Current: {old||'Not recorded'}</small><small>Wiki: {next||'Not recorded'}</small></span></label>)}</div>{preview.version&&!versions.includes(preview.version)&&<p>Add version {preview.version} in Manage FEH Versions before merging that field.</p>}<h4>Skills to add</h4><ul className="wiki-import-skills">{preview.skills.map(s=>{const present=existing.some(old=>key(old.slot,old.name)===key(s.slot,s.name)),unsupported=s.slot==='X'&&!hero.category.toLowerCase().includes('attuned'),missingIcon=['A','B','C','X'].includes(s.slot)&&!s.icon;return <li key={key(s.slot,s.name)}><label><input type="checkbox" disabled={busy||present||unsupported||missingIcon} checked={chosen.has(key(s.slot,s.name))} onChange={()=>toggle(key(s.slot,s.name))}/>{s.icon&&<img src={s.icon} alt=""/>}<span>{s.slot} · {s.name}<small>{present?'Already recorded':unsupported?'X only applies to Attuned heroes':missingIcon?'Icon unavailable — add manually':'New skill'}</small></span></label></li>})}</ul><button disabled={busy||!chosen.size} onClick={()=>void merge()}>Merge selected info</button></>}{!preview&&<p>Preview first. Nothing changes until you choose Merge selected info.</p>}</dialog>;
}
