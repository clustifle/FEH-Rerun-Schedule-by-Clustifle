import {moveBanner} from './banner-order';
import {ArrowDown,ArrowUp,ChevronsDown,ChevronsUp,Layers,Search,GripVertical,X} from 'lucide-react';
import {useEffect,useRef,useState} from 'react';
import {supabase} from './static-data';
import type {Banner} from './Homepage';

export default function BannerReorganizer({banners,onClose,onSaved}:{banners:Banner[];onClose:()=>void;onSaved:()=>Promise<void>}){
 const dialog=useRef<HTMLDialogElement>(null);
 const sorted=[...banners].sort((a,b)=>(a.sort_order??2147483647)-(b.sort_order??2147483647));
 const [rows,setRows]=useState<Banner[]>(sorted);
 const [selectedId,setSelectedId]=useState(sorted[0]?.id||'');
 const [search,setSearch]=useState(''),[confirmClose,setConfirmClose]=useState(false),[dragging,setDragging]=useState('');
 const [saving,setSaving]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');

 useEffect(()=>{
  const next=[...banners].sort((a,b)=>(a.sort_order??2147483647)-(b.sort_order??2147483647));
  setRows(current=>{const available=new Map(next.map(b=>[b.id,b]));const retained=current.flatMap(b=>{const updated=available.get(b.id);if(!updated)return[];available.delete(b.id);return[updated];});return [...retained,...next.filter(b=>available.has(b.id))];});
  setSelectedId(current=>current&&next.some(b=>b.id===current)?current:next[0]?.id||'');
 },[banners]);

 useEffect(()=>{dialog.current?.showModal();const overflow=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{dialog.current?.close();document.body.style.overflow=overflow;};},[]);

 const dirty=rows.map(b=>b.id).join(',')!==sorted.map(b=>b.id).join(',');
 const index=rows.findIndex(b=>b.id===selectedId);
 function close(){if(saving)return;if(dirty)setConfirmClose(true);else onClose();}
 function moveId(id:string,to:number){if(saving||to<0||to>=rows.length||rows[to]?.id===id)return;setRows(old=>moveBanner(old,id,to));setSelectedId(id);setMessage("Order changed. Save to apply it.");}
 function move(to:number){
  if(index<0||to<0||to>=rows.length||index===to)return;
  setRows(old=>{const next=[...old];next.splice(to,0,next.splice(index,1)[0]);return next;});
   setMessage('');
 }

 async function save(){
  setSaving(true); setError('');
  try{
   const ordered_ids=rows.map(b=>b.id);
   const {error}=await supabase.rpc('reorder_tracker_banners',{ordered_ids});
   if(error)throw error;
    setMessage('Banner order saved.');
   await onSaved();
  }catch(error){
   const message=error&&typeof error==='object'&&'message'in error?String(error.message):String(error);
   setError(message.includes('reorder_tracker_banners')||message.includes('schema cache')
    ?'Banner ordering is not set up in Supabase yet. Run supabase/banner-order.sql in the SQL Editor, then try again.'
    :'Could not save banner order: '+message);
  }finally{setSaving(false);} 
 }

 return <dialog ref={dialog} className="banner-reorganizer" aria-labelledby="banner-order-title" onCancel={e=>{e.preventDefault();close();}}>
  <header>
   <div>
    <h2 id="banner-order-title"><Layers size={22}/>Reorganize banners</h2>
    <p>Drag banners or use the move controls to arrange their order on Home.</p>
   </div>
   <button className="icon-button" aria-label="Close banner reorganizer" disabled={saving} onClick={close}><X/></button>
  </header>
  <div className="banner-order-tools">
   <label className="banner-order-search"><Search size={18}/><input type="search" aria-label="Find a banner" placeholder="Find a banner…" value={search} onChange={e=>setSearch(e.target.value)}/></label><span>{rows.length} banners</span>
   <div>
    {[{icon:ChevronsUp,label:'Move to first',to:0},{icon:ArrowUp,label:'Move up',to:index-1},{icon:ArrowDown,label:'Move down',to:index+1},{icon:ChevronsDown,label:'Move to last',to:rows.length-1}].map(({icon:Icon,label,to})=>
     <button key={label} className="icon-button" title={label} aria-label={label} disabled={saving||index<0||to<0||to>=rows.length||to===index} onClick={()=>move(to)}><Icon size={19}/></button>
    )}
   </div>
  </div>
  <ol className="banner-order-list" aria-label="Banner order list">
   {rows.map((banner,i)=>({banner,i})).filter(({banner})=>banner.name.toLowerCase().includes(search.trim().toLowerCase())).map(({banner,i})=>
    <li key={banner.id} draggable={!saving} onDragStart={e=>{setDragging(banner.id);e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain",banner.id);}} onDragOver={e=>{if(dragging&&!saving)e.preventDefault();}} onDragEnd={()=>setDragging("")} onDrop={e=>{e.preventDefault();if(dragging)moveId(dragging,i);setDragging("");}}>
     <div className="banner-order-row">
      <button type="button" aria-pressed={selectedId===banner.id} disabled={saving} onClick={()=>setSelectedId(banner.id)} onKeyDown={e=>{if(e.altKey&&(e.key==='ArrowUp'||e.key==='ArrowDown')){e.preventDefault();moveId(banner.id,i+(e.key==='ArrowUp'?-1:1));}}}>
       <GripVertical size={17} aria-hidden="true"/><span className="banner-order-number">{i+1}</span>
       <span className={'banner-order-card '+(banner.banner_type==='remix'?'remix':banner.banner_type||'lme')}>
        <strong>{banner.name}</strong>
        <small>{banner.starts_on} · {banner.starts_time || '07:00'} to {banner.ends_on} · {banner.ends_time || '06:59'}</small>
       </span>
       <span className="banner-order-meta">{({lme:'L/M/E',featured:'New / Special',revival:'Return / DSH',remix:'Remix'} as Record<string,string>)[banner.banner_type||'lme']}</span>
      </button>
      <div className="banner-order-row-actions"><button type="button" className="icon-button" aria-label={'Move '+banner.name+' up'} disabled={saving||i===0} onClick={()=>moveId(banner.id,i-1)}><ArrowUp size={18}/></button><button type="button" className="icon-button" aria-label={'Move '+banner.name+' down'} disabled={saving||i===rows.length-1} onClick={()=>moveId(banner.id,i+1)}><ArrowDown size={18}/></button></div>
     </div>
    </li>
   )}
  </ol>
  {!!rows.length&&!rows.some(b=>b.name.toLowerCase().includes(search.trim().toLowerCase()))&&<p className="banner-order-empty">No banners match your search.</p>}
  {!rows.length&&<p className="banner-order-empty">No banners to organize.</p>}
  {confirmClose&&<div className="banner-order-discard" role="alert"><strong>Discard your unsaved order?</strong><button className="secondary" onClick={()=>setConfirmClose(false)}>Keep editing</button><button className="secondary" onClick={onClose}>Discard and close</button></div>}
  <footer>
   <p role={error?'alert':'status'}>{error||message||(dirty?'Unsaved changes · save or discard before closing.':'Select a banner or drag it into position. Alt + ↑ / ↓ also moves a focused banner.')}</p>
   <div>
    <button className="secondary" disabled={saving} onClick={close}>Cancel</button>
    <button className="secondary" disabled={saving||!dirty} onClick={()=>{setRows(sorted); setSelectedId(sorted[0]?.id||''); setConfirmClose(false);  setMessage(''); setError('');}}>Reset order</button>
    <button className="primary" disabled={saving||!dirty} onClick={()=>void save()}>{saving?'Saving…':'Save order'}</button>
   </div>
  </footer>
 </dialog>;
}
