import {useEffect,useRef,useState,type FormEvent} from 'react';
import {supabase} from './static-data';
import './AccountSetup.css';
export default function AccountSetup(){
 const dialog=useRef<HTMLDialogElement>(null),sequence=useRef(0);
 const [id,setId]=useState(''),[needed,setNeeded]=useState(false),[checking,setChecking]=useState(false),[username,setUsername]=useState(''),[name,setName]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[retry,setRetry]=useState(false);
 useEffect(()=>{
  let alive=true,timer:ReturnType<typeof setTimeout>|undefined,attempt=0;
  function schedule(){clearTimeout(timer);if(!alive)return;timer=setTimeout(()=>void check(),Math.min(30000,1000*2**Math.min(attempt++,5)));}
  async function check(){
   clearTimeout(timer);const ticket=++sequence.current;
   if(!navigator.onLine){setNeeded(false);setRetry(true);setChecking(false);schedule();return}
   setChecking(true);let authTimeout:ReturnType<typeof setTimeout>|undefined;
   try{
    const {data:{session},error}=await Promise.race([supabase.auth.getSession(),new Promise<never>((_,reject)=>{authTimeout=setTimeout(()=>reject(Error("Account connection timed out")),10000)})]);if(!alive||ticket!==sequence.current)return;if(error)throw error;
    if(!session){setNeeded(false);setId('');setRetry(false);attempt=0;return}
    setId(session.user.id);
    const {data,error:profileError}=await supabase.from('tracker_profiles').select('username,display_name').eq('id',session.user.id).abortSignal(AbortSignal.timeout(10000)).maybeSingle();
    if(!alive||ticket!==sequence.current)return;if(profileError)throw profileError;
    const recovered=attempt>0;attempt=0;setName(data?.display_name||'');setUsername(data?.username||'');setError('');setRetry(false);setNeeded(!/^[a-z0-9_]{3,24}$/.test(data?.username||''));
    if(recovered)window.dispatchEvent(new Event('account-connection-restored'));
   }catch{if(alive&&ticket===sequence.current){setError('Could not check your account. Reconnecting automatically.');setRetry(true);setNeeded(false);schedule()}}
   finally{clearTimeout(authTimeout);if(alive&&ticket===sequence.current)setChecking(false)}
  }
  const resume=()=>{if(document.visibilityState!=='hidden')void check()};
  void check();window.addEventListener('owner-session-change',check);window.addEventListener('profile-updated',check);window.addEventListener('online',resume);window.addEventListener('focus',resume);document.addEventListener('visibilitychange',resume);
  return()=>{alive=false;sequence.current++;clearTimeout(timer);window.removeEventListener('owner-session-change',check);window.removeEventListener('profile-updated',check);window.removeEventListener('online',resume);window.removeEventListener('focus',resume);document.removeEventListener('visibilitychange',resume)};
 },[]); useEffect(()=>{if(needed&&!dialog.current?.open)dialog.current?.showModal();else if(!needed)dialog.current?.close();},[needed]);
 async function save(e:FormEvent){e.preventDefault();if(busy||checking||retry||!id)return;const value=username.trim();if(!/^[a-z0-9_]{3,24}$/.test(value)){setError('Use 3–24 lowercase letters, numbers or underscores.');return;}setBusy(true);setError('');try{const {error}=await supabase.from('tracker_profiles').upsert({id,username:value,display_name:name.trim()||value},{onConflict:'id'});if(error)throw error;setNeeded(false);window.dispatchEvent(new Event('profile-updated'));}catch(e){setError(e&&typeof e==='object'&&'code' in e&&e.code==='23505'?'That username is already taken. Choose another.':'Could not save your username. Please try again.');}finally{setBusy(false);}}
 return <>{retry&&!needed&&<aside className="account-connection-notice" role="status">Reconnecting to your account…<button type="button" onClick={()=>window.dispatchEvent(new Event("owner-session-change"))}>Retry now</button></aside>}<dialog ref={dialog} className="account-username-setup" aria-labelledby="username-setup-title" onCancel={e=>e.preventDefault()}><form onSubmit={save}><h2 id="username-setup-title">Set your username</h2>{checking?<p role="status">Checking your account...</p>:retry?<><p role="alert">{error}</p><button type="button" onClick={()=>window.dispatchEvent(new Event('owner-session-change'))}>Try again</button></>:<><p>Choose a username to continue to the schedules. You can customize your profile later.</p><label>Username<input autoFocus required autoComplete="username" minLength={3} maxLength={24} pattern="[a-z0-9_]{3,24}" value={username} disabled={busy} onChange={e=>{setUsername(e.target.value.toLowerCase());setError('');}}/></label><small>3–24 lowercase letters, numbers or underscores.</small>{error&&<p role="alert" className="error">{error}</p>}<button className="primary" disabled={busy}>{busy?'Saving...':'Save & continue'}</button></>}</form></dialog></>;
}

