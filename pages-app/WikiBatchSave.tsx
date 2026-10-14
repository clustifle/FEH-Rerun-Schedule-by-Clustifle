import {isStarterHero} from './hero-pools';
import {useRef,useState} from 'react';
import {apiFetch,supabase} from './static-data';
import {uploadCommunityImage} from './community-api';
import {downloadWikiImage,prepareWikiHeroSkills} from './wiki-hero-draft';
import {definitionNames,useDefinitions} from './catalog';
import {wikiMatch,type WikiHero} from './wiki-hero-import';
import type {ImportedHeroSkill} from './AdminHeroSkills';
type Choice={selected:boolean;pool:string;schedule:string;month:string;status:string;done:boolean};
export default function WikiBatchSave({items,heroes,onBusy,onSaved,loading}:{items:WikiHero[];heroes:{id:string;name:string;title:string}[];onBusy:(busy:boolean)=>void;onSaved:()=>Promise<void>;loading:boolean}){
 const definitions=useDefinitions(),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [choices,setChoices]=useState<Record<string,Choice>>({});
 const prepared=useRef(new Map<string,{id:string;portrait:File;skills:ImportedHeroSkill[];heroSaved:boolean}>());
 const existing=(wiki:WikiHero)=>heroes.some(h=>h.id!==prepared.current.get(wiki.url)?.id&&wikiMatch(wiki.title,h.name+': '+h.title));
 const choice=(wiki:WikiHero):Choice=>choices[wiki.url]||{selected:!existing(wiki),pool:wiki.identity?.heroicGrail?'Grail Pool':'',schedule:'None',month:'',status:'',done:false};
 function change(wiki:WikiHero,update:Partial<Choice>){setChoices(old=>({...old,[wiki.url]:{...choice(wiki),...update}}));}
 async function save(){if(busy||loading)return;const selected=items.filter(w=>choice(w).selected&&!choice(w).done&&!existing(w));if(!selected.length)return;
  if(selected.some(w=>(!choice(w).pool&&!isStarterHero({name:w.identity?.name,title:w.identity?.title,category:w.identity?.heroType}))||(choice(w).schedule==='General'&&!choice(w).month))){setError('Choose a pool for every selected hero and a rerun month where required.');return;}
  setBusy(true);onBusy(true);setError('');let saved=0;
  try{const {data:current,error:readError}=await supabase.from('heroes').select('id,name,title');if(readError)throw readError;
   for(const wiki of selected){const identity=wiki.identity!,settings=choice(wiki);let entry=prepared.current.get(wiki.url);
    if(current?.some(h=>h.id!==entry?.id&&wikiMatch(wiki.title,h.name+': '+h.title))){change(wiki,{selected:false,status:'Already on site — skipped'});continue;}
    try{change(wiki,{status:'Preparing portrait and skills…'});
     if(!entry){const [portrait,skills]=await Promise.all([downloadWikiImage(identity.portrait!,identity.portraitThumbnail),prepareWikiHeroSkills(wiki)]);entry={id:crypto.randomUUID(),portrait,skills,heroSaved:false};prepared.current.set(wiki.url,entry);}
     if(!entry.heroSaved){const form=new FormData();for(const [key,value] of Object.entries({id:entry.id,name:identity.name,title:identity.title,category:identity.heroType,color:identity.color!,weapon_type:identity.weaponType!,move_type:identity.moveType!,blessing:identity.blessing||'',debut_version:wiki.version||'',release_date:wiki.releaseDate||'',pool:settings.pool,schedule:settings.schedule,month:settings.month,notes:''}))form.set(key,value);form.set('portrait',entry.portrait);if(identity.demote)form.set('demote','on');if(identity.heroicGrail)form.set('heroic_grail','on');const response=await apiFetch('/api/heroes',{method:'POST',body:form}),body=await response.json();if(!response.ok)throw Error(body.error||'Hero could not be saved');entry.heroSaved=true;}
     change(wiki,{status:'Saving skills…'});for(const imported of entry.skills){if(imported.file&&!imported.skill.icon_url)imported.skill.icon_url=(await uploadCommunityImage(imported.file,'hero')).split('?')[0];const {error}=await supabase.from('tracker_hero_skills').upsert({...imported.skill,hero_id:entry.id});if(error)throw error;}
     change(wiki,{done:true,status:'Saved',selected:false});saved++;
    }catch(e){change(wiki,{status:(entry?.heroSaved?'Hero saved; retry remaining skills. ':'')+(e instanceof Error?e.message:'Import failed')});}
   }
   await onSaved();setError(saved+' heroes completed. Any unfinished imports remain available to retry.');
  }catch(e){setError(e instanceof Error?e.message:'Could not save selected heroes');}finally{setBusy(false);onBusy(false);}
 }
 return <section className="wiki-batch-save"><h3>Save multiple heroes</h3><p>Choose a pool and schedule for each hero, then save the selected imports together.</p>{items.map(wiki=>{const c=choice(wiki),present=existing(wiki)&&!prepared.current.has(wiki.url),invalid=!wiki.identity?.portrait||!wiki.identity.moveType||!wiki.identity.weaponType||!wiki.identity.color||!definitionNames(definitions,'hero_type').includes(wiki.identity.heroType);return <fieldset key={wiki.url} disabled={busy||loading||c.done||present||invalid}><label><input type="checkbox" checked={c.selected&&!present&&!invalid} onChange={e=>change(wiki,{selected:e.target.checked})}/>{wiki.title}</label><div className="wiki-batch-fields"><label>Pool for {wiki.title}<select aria-label={'Pool for '+wiki.title} disabled={!!prepared.current.get(wiki.url)?.heroSaved||isStarterHero({name:wiki.identity?.name,title:wiki.identity?.title,category:wiki.identity?.heroType})} value={c.pool} onChange={e=>change(wiki,{pool:e.target.value})}><option value="">{isStarterHero({name:wiki.identity?.name,title:wiki.identity?.title,category:wiki.identity?.heroType})?'Starter unit · no summoning pool':'Choose pool'}</option>{definitionNames(definitions,'pool').map(p=><option key={p}>{p}</option>)}</select></label><label>Schedule for {wiki.title}<select aria-label={'Schedule for '+wiki.title} disabled={!!prepared.current.get(wiki.url)?.heroSaved} value={c.schedule} onChange={e=>change(wiki,{schedule:e.target.value,month:''})}><option value="None">None</option><option value="General">L/M/E Schedule</option><option value="Waitlist">L/M/E Waitlist</option><option value="Schedule Under Consideration">Schedule Under Consideration</option></select></label>{c.schedule==='General'&&<label>Next rerun month for {wiki.title}<input type="month" aria-label={'Next rerun month for '+wiki.title} disabled={!!prepared.current.get(wiki.url)?.heroSaved} value={c.month} onChange={e=>change(wiki,{month:e.target.value})}/></label>}</div><p role="status">{c.status||(present?'Already on site — excluded':invalid?'Missing required hero information — use individual review':'')}</p></fieldset>;})}<button type="button" className="primary" disabled={busy||loading||!items.some(w=>choice(w).selected&&!choice(w).done&&!existing(w))} onClick={()=>void save()}>{busy?'Saving selected heroes…':'Save selected heroes'}</button>{error&&<p role="status">{error}</p>}</section>;
}
