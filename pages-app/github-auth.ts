import {supabase,supabaseUrl,supabasePublishableKey} from './static-data';
import {settingsUrl,viewUrl} from './routes';
import {requestTimeout} from './browser-compat';
export const githubPendingKey='feh-github-auth-return';
export type GitHubPending={intent:'signin'|'link';path:string;userId?:string};
export function safeAuthReturn(path:string){
 const url=new URL(path,location.origin);
 return url.origin===location.origin&&url.pathname.startsWith(import.meta.env.BASE_URL)?url.pathname+url.search:viewUrl('Homepage');
}
export function githubAuthError(error:unknown){
 const code=error&&typeof error==='object'&&'code' in error?String(error.code):'';
 if(code==='identity_already_exists')return 'This GitHub account is already linked to another website account.';
 if(code==='manual_linking_disabled')return 'GitHub account linking is not available yet. Please try again later.';
 if(code==='provider_disabled')return 'GitHub sign-in is not available yet. You can still sign in with email.';
 if(code==='access_denied')return 'GitHub authorization was cancelled. Your account has not been changed.';
 return 'Could not connect to GitHub. Please try again.';
}
export async function startGitHubAuth(userId?:string){
 const pending:GitHubPending={intent:userId?'link':'signin',path:userId?settingsUrl('Account'):safeAuthReturn(location.pathname+location.search),...(userId?{userId}:{})};
 try{
  // Check availability before leaving the website for a disabled provider.
  const timeout=requestTimeout(12000);
  let response:Response;
  try{response=await fetch(supabaseUrl+'/auth/v1/settings',{headers:{apikey:supabasePublishableKey},signal:timeout.signal});}finally{timeout.clear();}
  if(!response.ok)throw new Error('Provider unavailable');
  const settings=await response.json();
  if(!settings.external?.github)throw {code:'provider_disabled'};
  sessionStorage.setItem(githubPendingKey,JSON.stringify(pending));
  const options={redirectTo:location.origin+import.meta.env.BASE_URL+'?auth=github',scopes:'user:email',skipBrowserRedirect:true};
  const result=userId?await supabase.auth.linkIdentity({provider:'github',options}):await supabase.auth.signInWithOAuth({provider:'github',options});
  if(result.error)throw result.error;
  if(!result.data.url)throw new Error('Missing authorization URL');
  const authorize=new URL(result.data.url);
  const hostedAuth=authorize.origin===new URL(supabaseUrl).origin&&authorize.pathname.startsWith('/auth/v1/');
  const githubAuthorize=authorize.origin==='https://github.com'&&authorize.pathname==='/login/oauth/authorize';
  if(!hostedAuth&&!githubAuthorize)throw new Error('Unexpected authorization URL');
  if(hostedAuth)authorize.searchParams.delete('skip_http_redirect');
  location.assign(authorize.href);
 }catch(error){try{sessionStorage.removeItem(githubPendingKey);}catch{}throw new Error(githubAuthError(error));}
}
