import {useCallback,useEffect,useRef,useState} from 'react';
import {X} from 'lucide-react';
import Profile from './Profile';
import {goTo,readRoute,viewUrl} from './routes';
import './Profile.css';
export default function ProfileEditorDialog(){
 const [open,setOpen]=useState(false),[busy,setBusy]=useState(false);const dialog=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLElement|null>(null);
 const close=useCallback(()=>{dialog.current?.close();setOpen(false);setBusy(false);requestAnimationFrame(()=>trigger.current?.isConnected&&trigger.current.focus());},[]);
 useEffect(()=>{const edit=()=>{trigger.current=document.activeElement instanceof HTMLElement?document.activeElement:null;setOpen(true);};window.addEventListener('edit-profile',edit);return()=>window.removeEventListener('edit-profile',edit);},[]);
 useEffect(()=>{if(open){dialog.current?.showModal();const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous;};}},[open]);
 const saved=useCallback((username:string)=>{if(readRoute().view==='Profile')goTo(viewUrl('Profile','',username));close();},[close]);
 return <dialog ref={dialog} className="profile-edit-dialog" aria-labelledby="profile-edit-title" onCancel={e=>{e.preventDefault();if(!busy)close();}} onClose={()=>{if(open)close();}}><header className="profile-edit-heading fb-heading"><h2 id="profile-edit-title">Edit Profile</h2><button type="button" className="icon-button" aria-label="Close Edit Profile" disabled={busy} onClick={close}><X size={22}/></button></header><div className="profile-edit-body">{open&&<Profile editor onSaved={saved} onBusyChange={setBusy}/>}</div><footer className="profile-edit-footer"><button type="button" className="secondary" disabled={busy} onClick={close}>Cancel</button><button type="submit" className="primary" form="public-profile-edit-form" disabled={busy}>{busy?'Please wait…':'Save profile'}</button></footer></dialog>;
}
