import {useEffect,useState} from 'react';
import {X} from 'lucide-react';
import {supabase} from './static-data';

const dismissed=new Set<string>();
export default function AccountSetup(){
 const [visible,setVisible]=useState(false);
 const [userId,setUserId]=useState('');
 useEffect(()=>{let alive=true;let sequence=0;async function check(){const current=++sequence;try{const {data:{session},error}=await supabase.auth.getSession();if(!alive||current!==sequence)return;if(error||!session){setUserId('');return;}const id=session.user.id;let seen=dismissed.has(id);try{seen=seen||localStorage.getItem('feh-profile-welcome-notice-'+id)==='seen';}catch{}setUserId(seen?'':id);}catch{if(alive&&current===sequence)setUserId('');}}void check();window.addEventListener('owner-session-change',check);return()=>{alive=false;sequence++;window.removeEventListener('owner-session-change',check);};},[]);
 useEffect(()=>{setVisible(false);if(!userId)return;const timer=setTimeout(()=>setVisible(true),350);return()=>clearTimeout(timer);},[userId]);
 function close(){if(userId){dismissed.add(userId);try{localStorage.setItem('feh-profile-welcome-notice-'+userId,'seen');localStorage.removeItem('feh-setup-'+userId);}catch{}}setVisible(false);setUserId('');}
 return visible&&userId?<aside className="profile-welcome-notice" aria-label="Profile customization notification"><div><div role="status"><strong>Welcome!</strong><p>Customize your profile anytime with Edit Profile.</p></div><button type="button" className="profile-welcome-notice-link" onClick={()=>{close();window.dispatchEvent(new Event('edit-profile'));}}>Customize profile</button></div><button type="button" className="profile-welcome-notice-close" aria-label="Dismiss welcome notification" onClick={close}><X size={18}/></button></aside>:null;
}
