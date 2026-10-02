import {useEffect,useRef,useState} from 'react';
import {X,LockKeyhole} from 'lucide-react';
import {supabase,ownerSession} from './static-data';
const ownerEmail='shyguyvn@gmail.com';
export default function OwnerLogin(){
 const dialog=useRef<HTMLDialogElement>(null);
 const [mode,setMode]=useState<'login'|'forgot'|'recovery'>('login'),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 useEffect(()=>{
  const open=()=>{setMode('login');setError('');setMessage('');dialog.current?.showModal();};
  const signOut=()=>{void supabase.auth.signOut().then(()=>window.dispatchEvent(new Event('owner-session-change')));};
  window.addEventListener('open-owner-login',open);window.addEventListener('owner-sign-out',signOut);
  const {data:{subscription}}=supabase.auth.onAuthStateChange(event=>{
   if(event==='PASSWORD_RECOVERY'){setMode('recovery');setError('');setMessage('');dialog.current?.showModal();}
   setTimeout(()=>window.dispatchEvent(new Event('owner-session-change')),0);
  });
  return()=>{window.removeEventListener('open-owner-login',open);window.removeEventListener('owner-sign-out',signOut);subscription.unsubscribe();};
 },[]);
 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();setBusy(true);setError('');setMessage('');
  const form=new FormData(event.currentTarget);
  try{
   if(mode==='forgot'){
    const {error}=await supabase.auth.resetPasswordForEmail(ownerEmail,{redirectTo:location.origin+import.meta.env.BASE_URL});
    if(error)throw error;setMessage('Check your owner email for the password reset link.');
   }else if(mode==='recovery'){
    const password=String(form.get('password'));if(password!==form.get('confirm'))throw new Error('Passwords do not match.');
    const {data:{user}}=await supabase.auth.getUser();if(!user||user.email?.toLowerCase()!==ownerEmail)throw new Error('This reset link is not for the owner account.');
    const {error}=await supabase.auth.updateUser({password});if(error)throw error;setMessage('Password updated. You can close this window.');setMode('login');history.replaceState(null,'',location.pathname);
   }else{
    const {error}=await supabase.auth.signInWithPassword({email:ownerEmail,password:String(form.get('password'))});
    if(error)throw new Error('Could not sign in. Check your password or use Forgot password.');
    if(!await ownerSession()){await supabase.auth.signOut();throw new Error('This account is not authorized to edit the tracker.');}
    window.dispatchEvent(new Event('owner-session-change'));dialog.current?.close();
   }
  }catch(e){setError(e instanceof Error?e.message:'Could not complete this request.');}finally{setBusy(false);}
 }
 return <dialog ref={dialog} className="owner-login-popup" aria-labelledby="owner-login-title" onCancel={e=>{if(busy)e.preventDefault();}}><form onSubmit={submit} key={mode}><div className="dialog-top"><LockKeyhole/><button type="button" className="icon-button" aria-label="Close owner login" disabled={busy} onClick={()=>dialog.current?.close()}><X/></button></div><h2 id="owner-login-title">{mode==='recovery'?'Choose a new password':mode==='forgot'?'Reset owner password':'Owner sign in'}</h2><p className="owner-login-intro">Only the owner account can manage this schedule.</p><label>Email<input type="email" value={ownerEmail} readOnly autoComplete="username"/></label>{mode!=='forgot'&&<label>{mode==='recovery'?'New password':'Password'}<input type="password" name="password" required minLength={mode==='recovery'?12:undefined} autoComplete={mode==='recovery'?'new-password':'current-password'} disabled={busy}/></label>}{mode==='recovery'&&<label>Confirm new password<input type="password" name="confirm" required minLength={12} autoComplete="new-password" disabled={busy}/></label>}{error&&<p role="alert" className="error">{error}</p>}{message&&<p role="status" className="import-success">{message}</p>}<button className="primary" disabled={busy}>{busy?'Please wait…':mode==='recovery'?'Update password':mode==='forgot'?'Send reset link':'Sign in'}</button><button type="button" className="owner-forgot" disabled={busy} onClick={()=>{setMode(mode==='forgot'?'login':'forgot');setError('');setMessage('');}}>{mode==='forgot'?'Back to sign in':mode==='login'?'Forgot password?':'Back to sign in'}</button></form></dialog>;
}
