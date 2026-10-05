import {useEffect,useRef,useState} from 'react';
import {X,UserRound} from 'lucide-react';
import {supabase} from './static-data';
import {goTo,settingsUrl} from './routes';
const dismissed=new Set<string>();
export default function AccountSetup(){
 const dialog=useRef<HTMLDialogElement>(null);
 const [userId,setUserId]=useState('');
 useEffect(()=>{let alive=true;let sequence=0;async function check(){const current=++sequence;try{const {data:{session},error}=await supabase.auth.getSession();if(!alive||current!==sequence)return;if(error||!session){setUserId('');return;}const id=session.user.id;let seen=dismissed.has(id);try{seen=seen||localStorage.getItem('feh-profile-welcome-'+id)==='seen';}catch{}setUserId(seen?'':id);}catch{if(alive&&current===sequence)setUserId('');}}void check();window.addEventListener('owner-session-change',check);return()=>{alive=false;sequence++;window.removeEventListener('owner-session-change',check);};},[]);
 useEffect(()=>{if(!userId){dialog.current?.close();return;}const timer=setTimeout(()=>{if(dialog.current&&!dialog.current.open)dialog.current.showModal();},350);return()=>clearTimeout(timer);},[userId]);
 function close(){if(userId){dismissed.add(userId);try{localStorage.setItem('feh-profile-welcome-'+userId,'seen');localStorage.removeItem('feh-setup-'+userId);}catch{}}dialog.current?.close();setUserId('');}
 return <dialog ref={dialog} className="profile-welcome" aria-labelledby="profile-welcome-title" aria-describedby="profile-welcome-description" onCancel={e=>{e.preventDefault();close();}}><button type="button" className="profile-welcome-close" aria-label="Close welcome" onClick={close}><X size={20}/></button><UserRound className="profile-welcome-symbol" size={28}/><h2 id="profile-welcome-title">Welcome!</h2><p id="profile-welcome-description">Make your profile yours. Add a name, picture, bio, and favorite Fire Emblem heroes whenever you’re ready.</p><p className="profile-welcome-hint">You can always find these options in Settings → Account.</p><div className="profile-welcome-actions"><button type="button" className="secondary" onClick={close}>Maybe later</button><button type="button" className="primary" onClick={()=>{close();goTo(settingsUrl('Account'));}}>Customize profile</button></div></dialog>;
}
