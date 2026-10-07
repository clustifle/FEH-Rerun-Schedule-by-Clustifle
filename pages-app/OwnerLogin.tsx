import {useEffect,useRef,useState} from 'react';
import {X} from 'lucide-react';
import {supabase,assetUrl} from './static-data';

export default function OwnerLogin(){
 const dialog=useRef<HTMLDialogElement>(null);
 const [email,setEmail]=useState('');
 const [mode,setMode]=useState<'login'|'signup'|'forgot'|'recovery'>('login'),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 useEffect(()=>{
  const open=()=>{setEmail('');setMode('login');setError('');setMessage('');dialog.current?.showModal();};
  const signup=()=>{setEmail('');setMode('signup');setError('');setMessage('');dialog.current?.showModal();};
  const signOut=()=>{void supabase.auth.signOut().then(()=>window.dispatchEvent(new Event('owner-session-change')));};
  window.addEventListener('open-owner-login',open);window.addEventListener('open-account-signup',signup);window.addEventListener('owner-sign-out',signOut);
  const {data:{subscription}}=supabase.auth.onAuthStateChange(event=>{
   if(event==='PASSWORD_RECOVERY'){setMode('recovery');setError('');setMessage('');dialog.current?.showModal();}
   setTimeout(()=>window.dispatchEvent(new Event('owner-session-change')),0);
  });
  return()=>{window.removeEventListener('open-owner-login',open);window.removeEventListener('open-account-signup',signup);window.removeEventListener('owner-sign-out',signOut);subscription.unsubscribe();};
 },[]);
 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();setBusy(true);setError('');setMessage('');
  const form=new FormData(event.currentTarget);
  try{
   if(mode==='forgot'){
    
    const {error}=await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(),{redirectTo:location.origin+import.meta.env.BASE_URL});
    if(error)throw error;setMessage('Check your email for the password reset link.');
   }else if(mode==='recovery'){
    const password=String(form.get('password'));if(password!==form.get('confirm'))throw new Error('Passwords do not match.');
    const {data:{user}}=await supabase.auth.getUser();if(!user)throw new Error('This reset link is no longer valid. Request a new link.');
    const {error}=await supabase.auth.updateUser({password});if(error)throw error;setMessage('Password updated. You can close this window.');setMode('login');history.replaceState(null,'',location.pathname);
   }else if(mode==='signup'){
    const password=String(form.get('password'));if(password!==form.get('confirm'))throw new Error('Passwords do not match.');
    const {data,error}=await supabase.auth.signUp({email:email.trim().toLowerCase(),password,options:{emailRedirectTo:location.origin+import.meta.env.BASE_URL}});if(error)throw error;if(data.session){window.dispatchEvent(new Event('owner-session-change'));dialog.current?.close();}else setMessage('Check your email to confirm your account, then sign in. If you already have an account, use Sign in or Forgot password.');
   }else{
    const {error}=await supabase.auth.signInWithPassword({email:email.trim().toLowerCase(),password:String(form.get('password'))});
    if(error)throw new Error('Could not sign in. Check your password or use Forgot password.');
    window.dispatchEvent(new Event('owner-session-change'));dialog.current?.close();
   }
  }catch(e){setError(e instanceof Error?e.message:'Could not complete this request.');}finally{setBusy(false);}
 }
 return <dialog ref={dialog} className="owner-login-popup" aria-labelledby="owner-login-title" onCancel={e=>{if(busy)e.preventDefault();}}><form onSubmit={submit} key={mode}><div className="dialog-top"><img className="account-popup-logo" src={assetUrl('clustifle-feh-rerun-logo.png')} alt="FEH Rerun Schedule"/><button type="button" className="icon-button" aria-label="Close account sign in" disabled={busy} onClick={()=>dialog.current?.close()}><X/></button></div><h2 id="owner-login-title">{mode==='recovery'?'Choose a new password':mode==='forgot'?'Reset account password':mode==='signup'?'Create an account':'Account sign in'}</h2><p className="owner-login-intro">{mode==='signup'?'Create your profile and keep track of your favorite heroes. New accounts have visitor access.':mode==='login'?'Welcome back. Sign in to your FEH Rerun account.':'Follow the steps below to recover access to your account.'}</p>{mode!=='recovery'&&<label>Email<input type="email" name="email" value={email} onChange={event=>setEmail(event.target.value)} required autoComplete="off" placeholder="Enter your email" disabled={busy}/></label>}{mode!=='forgot'&&<label>{mode==='recovery'?'New password':'Password'}<input type="password" name="password" required minLength={mode==='recovery'||mode==='signup'?12:undefined} autoComplete={mode==='recovery'||mode==='signup'?'new-password':'current-password'} disabled={busy}/></label>}{(mode==='recovery'||mode==='signup')&&<label>Confirm password<input type="password" name="confirm" required minLength={12} autoComplete="new-password" disabled={busy}/></label>}{error&&<p role="alert" className="error">{error}</p>}{message&&<p role="status" className="import-success">{message}</p>}<button className="primary" disabled={busy}>{busy?'Please wait…':mode==='recovery'?'Update password':mode==='forgot'?'Send reset link':mode==='signup'?'Create account':'Sign in'}</button>{(mode==='login'||mode==='signup')&&<button type="button" className="owner-forgot" disabled={busy} onClick={()=>{setMode(mode==='login'?'signup':'login');setError('');setMessage('');}}>{mode==='login'?'Create an account':'Already have an account? Sign in'}</button>}{mode!=='signup'&&<button type="button" className="owner-forgot" disabled={busy} onClick={()=>{setMode(mode==='login'?'forgot':'login');setError('');setMessage('');}}>{mode==='forgot'?'Back to sign in':mode==='login'?'Forgot password?':'Back to sign in'}</button>}</form></dialog>;
}
