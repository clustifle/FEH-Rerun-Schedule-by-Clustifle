import HeroPortraitMarks from './HeroPortraitMarks';
import {ArrowDown,ArrowUp,ChevronsDown,ChevronsUp,Layers,X} from 'lucide-react';
import {useEffect,useRef,useState} from 'react';
import {supabase} from './static-data';
import type {Banner} from './Homepage';

export default function BannerReorganizer({banners,onClose,onSaved}:{banners:Banner[];onClose:()=>void;onSaved:()=>Promise<void>}){
 const dialog=useRef<HTMLDialogElement>(null);
 const sorted=[...banners].sort((a,b)=>(a.sort_order??2147483647)-(b.sort_order??2147483647));
 const [rows,setRows]=useState<Banner[]>(sorted);
 const [selectedId,setSelectedId]=useState(sorted[0]?.id||'');
 const [saving,setSaving]=useState(false),[dirty,setDirty]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');

 useEffect(()=>{
  const next=[...banners].sort((a,b)=>(a.sort_order??2147483647)-(b.sort_order??2147483647));
  setRows(next); setSelectedId(current=>current&&next.some(b=>b.id===current)?current:next[0]?.id||'');
 },[banners]);

 useEffect(()=>{dialog.current?.showModal();const overflow=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{dialog.current?.close();document.body.style.overflow=overflow;};},[]);

 const index=rows.findIndex(b=>b.id===selectedId);
 function move(to:number){
  if(index<0||to<0||to>=rows.length||index===to)return;
  setRows(old=>{const next=[...old];next.splice(to,0,next.splice(index,1)[0]);return next;});
  setDirty(true); setMessage('');
 }

 async function save(){
  setSaving(true); setError('');
  try{
   const ordered_ids=rows.map(b=>b.id);
   const {error}=await supabase.rpc('reorder_tracker_banners',{ordered_ids});
   if(error)throw error;
   setDirty(false); setMessage('Banner order saved.');
   await onSaved();
  }catch{
   setError('Could not save banner order. Ensure the banner sorting database update is installed, then try again.');
  }finally{setSaving(false);} 
 }

 return <dialog ref={dialog} className="banner-reorganizer" aria-labelledby="banner-order-title" onCancel={e=>{e.preventDefault();if(!saving)onClose();}}>
  <header>
   <div>
    <h2 id="banner-order-title"><Layers size={22}/>Reorganize active banners</h2>
    <p>Move active banners into the order you want them to appear in the carousel.</p>
   </div>
   <button className="icon-button" aria-label="Close banner reorganizer" disabled={saving} onClick={onClose}><X/></button>
  </header>
  <div className="banner-order-tools">
   <span>{rows.length} banners</span>
   <div>
    {[{icon:ChevronsUp,label:'Move to first',to:0},{icon:ArrowUp,label:'Move up',to:index-1},{icon:ArrowDown,label:'Move down',to:index+1},{icon:ChevronsDown,label:'Move to last',to:rows.length-1}].map(({icon:Icon,label,to})=>
     <button key={label} className="icon-button" title={label} aria-label={label} disabled={saving||index<0||to<0||to>=rows.length||to===index} onClick={()=>move(to)}><Icon size={19}/></button>
    )}
   </div>
  </div>
  <ol className="banner-order-list" aria-label="Banner order list">
   {rows.map((banner,i)=>
    <li key={banner.id}>
     <button type="button" aria-pressed={selectedId===banner.id} disabled={saving} onClick={()=>setSelectedId(banner.id)} onKeyDown={e=>{if(e.altKey&&(e.key==='ArrowUp'||e.key==='ArrowDown')){e.preventDefault();if(selectedId===banner.id)move(index+(e.key==='ArrowUp'?-1:1));}}}>
      <span className="banner-order-number">{i+1}</span>
      <span className={'banner-order-card '+(banner.banner_type==='remix'?'remix':banner.banner_type||'lme')}>
       <strong>{banner.name}</strong>
       <small>{banner.starts_on} · {banner.starts_time || '07:00'} to {banner.ends_on} · {banner.ends_time || '06:59'}</small>
      </span>
      <span className="banner-order-meta">{banner.banner_type ? banner.banner_type.toUpperCase() : 'LME'}</span>
     </button>
    </li>
   )}
  </ol>
  {!rows.length&&<p className="banner-order-empty">No active banners to organize.</p>}
  <footer>
   <p role={error?'alert':'status'}>{error||message||(dirty?'Unsaved changes · save or discard before closing.':'Select a banner, then use the move controls.')}</p>
   <div>
    <button className="secondary" disabled={saving||!dirty} onClick={()=>{setRows(sorted); setSelectedId(sorted[0]?.id||''); setDirty(false); setMessage(''); setError('');}}>Discard</button>
    <button className="primary" disabled={saving||!dirty} onClick={()=>void save()}>{saving?'Saving…':'Save order'}</button>
   </div>
  </footer>
 </dialog>;
}
