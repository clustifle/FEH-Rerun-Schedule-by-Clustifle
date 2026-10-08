import {useEffect,useState} from 'react';
import {X} from 'lucide-react';
import {supabase} from './static-data';
import {goTo,settingsUrl} from './routes';
import {githubPendingKey,githubAuthError,safeAuthReturn,type GitHubPending} from './github-auth';
const callbackParams=new URLSearchParams(location.hash.slice(1));
const queryParams=new URLSearchParams(location.search);
const callbackError=callbackParams.get('error_code')||queryParams.get('error_code')||callbackParams.get('error')||queryParams.get('error');
export default function GitHubAuthReturn(){
 const [result,setResult]=useState<{message:string;error:boolean;link:boolean}|null>(null);
 useEffect(()=>{let alive=true;let pending:GitHubPending|null=null;
  try{pending=JSON.parse(sessionStorage.getItem(githubPendingKey)||'null');}catch{}
  if(queryParams.get('auth')!=='github'||!pending||!['signin','link'].includes(pending.intent))return;
  const request=pending;
  async function finish(){
   try{
    const {data:{session},error}=await supabase.auth.getSession();
    if(!alive)return;
    if(callbackError)throw {code:callbackError};
    if(error||!session)throw new Error('No session');
    const {data:{user},error:userError}=await supabase.auth.getUser();
    if(!alive)return;
    if(userError||!user||!user.identities?.some(identity=>identity.provider==='github'))throw new Error('No GitHub identity');
    if(request.intent==='link'&&(user.id!==request.userId||!user.identities?.some(identity=>identity.provider==='github')))throw new Error('Identity not linked');
    sessionStorage.removeItem(githubPendingKey);
    // Supabase consumes the token fragment; remove remaining OAuth parameters.
    const clean=new URL(location.href);clean.hash='';for(const key of ['auth','code','error','error_code','error_description'])clean.searchParams.delete(key);history.replaceState(null,'',clean.pathname+clean.search);
    goTo(safeAuthReturn(request.path));
    window.dispatchEvent(new Event('owner-session-change'));
    setResult({message:request.intent==='link'?'GitHub account linked.':'Signed in with GitHub.',error:false,link:request.intent==='link'});
   }catch(error){if(!alive)return;sessionStorage.removeItem(githubPendingKey);const clean=new URL(location.href);clean.hash='';for(const key of ['auth','code','error','error_code','error_description'])clean.searchParams.delete(key);history.replaceState(null,'',clean.pathname+clean.search);goTo(safeAuthReturn(request.path));setResult({message:githubAuthError(error),error:true,link:request.intent==='link'});}
  }
  void finish();return()=>{alive=false;};
 },[]);
 return result?<aside className="github-auth-notice" aria-label="GitHub sign-in result"><p role={result.error?'alert':'status'}>{result.message}</p>{result.error&&<button className="secondary" onClick={()=>{setResult(null);if(result.link)goTo(settingsUrl('Account'));else window.dispatchEvent(new Event('open-owner-login'));}}>Try again</button>}<button className="icon-button" aria-label="Dismiss GitHub message" onClick={()=>setResult(null)}><X size={18}/></button></aside>:null;
}
