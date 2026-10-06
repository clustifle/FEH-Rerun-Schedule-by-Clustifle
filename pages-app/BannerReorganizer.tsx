import HeroPortraitMarks from './HeroPortraitMarks';
import {ArrowDown,ArrowUp,ChevronsDown,ChevronsUp,Layers,Trash2,X} from 'lucide-react';
import {useEffect,useRef,useState} from 'react';
import {apiFetch,supabase} from './static-data';
import type {Banner} from './Homepage';

export default function BannerReorganizer({banners,onClose,onSaved}:{banners:Banner[];onClose:()=>void;onSaved:()=>Promise<void>}){
 const dialog=useRef<HTMLDialogElement>(null);
 const sorted=[...banners].sort((a,b)=>(a.sort_order??2147483647)-(b.sort_order??2147483647));
 const [rows,setRows]=useState<Banner[]>(sorted);
 const [selectedId,setSelectedId]=useState(sorted[0]?.id||'');
 const [saving,setSaving]=useState(false),[dirty,setDirty]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');

 useEffect(()=>{
  const next=[...banners].sort((a,b)=>(a.sort_order??2147483647)-(b.sort_order??2147483647));
  setRows(current=>{const available=new Map(next.map(b=>[b.id,b]));const retained=current.flatMap(b=>{const updated=available.get(b.id);if(!updated)return[];available.delete(b.id);return[updated];});return [...retained,...next.filter(b=>available.has(b.id))];});
  setSelectedId(current=>current&&next.some(b=>b.id===current)?current:next[0]?.id||'');
 },[banners]);

 useEffect(()=>{dialog.current?.showModal();const overflow=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{dialog.current?.close();document.body.style.overflow=overflow;};},[]);

 const index=rows.findIndex(b=>b.id===selectedId);
 function move(to:number){
  if(index<0||to<0||to>=rows.length||index===to)return;
  setRows(old=>{const next=[...old];next.splice(to,0,next.splice(index,1)[0]);return next;});
  setDirty(true); setMessage('');
 }

 async function remove(banner:Banner){
  if(!confirm('Remove "'+banner.name+'" from banners? Its lineup will be removed, but the heroes themselves will remain.'))return;
  setSaving(true);setError('');setMessage('');
  try{
   const response=await apiFetch('/api/banners',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:banner.id})});
   const result=await response.json();
   if(!response.ok)throw new Error(result.error||'Could not remove banner.');
   const next=rows.filter(row=>row.id!==banner.id);
   setRows(next);
   if(selectedId===banner.id)setSelectedId(next[Math.min(rows.findIndex(row=>row.id===banner.id),next.length-1)]?.id||'');
   setMessage('"'+banner.name+'" removed.');
   window.dispatchEvent(new Event('banners-change'));
  }catch(error){
   setError('Could not remove banner: '+(error instanceof Error?error.message:String(error)));
  }finally{setSaving(false);}
 }

 async function save(){
  setSaving(true); setError('');
  try{
   const ordered_ids=rows.map(b=>b.id);
   const {error}=await supabase.rpc('reorder_tracker_banners',{ordered_ids});
   if(error)throw error;
   setDirty(false); setMessage('Banner order saved.');
   await onSaved();
  }catch(error){
   const message=error&&typeof error==='object'&&'message'in error?String(error.message):String(error);
   setError(message.includes('reorder_tracker_banners')||message.includes('schema cache')
    ?'Banner ordering is not set up in Supabase yet. Run supabase/banner-order.sql in the SQL Editor, then try again.'
    :'Could not save banner order: '+message);
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
     <div className="banner-order-row">
      <button type="button" aria-pressed={selectedId===banner.id} disabled={saving} onClick={()=>setSelectedId(banner.id)} onKeyDown={e=>{if(e.altKey&&(e.key==='ArrowUp'||e.key==='ArrowDown')){e.preventDefault();if(selectedId===banner.id)move(index+(e.key==='ArrowUp'?-1:1));}}}>
       <span className="banner-order-number">{i+1}</span>
       <span className={'banner-order-card '+(banner.banner_type==='remix'?'remix':banner.banner_type||'lme')}>
        <strong>{banner.name}</strong>
        <small>{banner.starts_on} · {banner.starts_time || '07:00'} to {banner.ends_on} · {banner.ends_time || '06:59'}</small>
       </span>
       <span className="banner-order-meta">{banner.banner_type ? banner.banner_type.toUpperCase() : 'LME'}</span>
      </button>
      <button type="button" className="banner-order-remove" aria-label={'Remove '+banner.name} title="Remove banner" disabled={saving} onClick={()=>void remove(banner)}><Trash2 size={18}/></button>
     </div>
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
