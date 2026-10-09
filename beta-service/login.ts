import {createClient} from '@supabase/supabase-js';
const client=createClient('https://aknsqeqykjgdyhdroqcx.supabase.co','sb_publishable_PiJIst1aSJtrYBiIvwDIVA_KS3c-E3g');
const status=document.getElementById('status')!,button=document.getElementById('signin') as HTMLButtonElement;
async function enter(){
 try{
  const {data:{session},error}=await client.auth.getSession();if(error)throw error;
  if(!session){status.textContent='Sign in with your existing Head Admin account.';button.hidden=false;return;}
  const result=await fetch('/_beta/session',{method:'POST',headers:{Authorization:'Bearer '+session.access_token}});
  if(!result.ok){status.textContent='This beta is restricted to Head Admin.';button.hidden=false;return;}
  location.replace('/home');
 }catch{status.textContent='Could not verify access. Please try again.';button.hidden=false;}
}
button.onclick=async()=>{button.disabled=true;status.textContent='Opening GitHub…';const {error}=await client.auth.signInWithOAuth({provider:'github',options:{redirectTo:location.origin+'/?auth=github',scopes:'user:email'}});if(error){status.textContent='Could not start GitHub sign-in.';button.disabled=false;}};
void enter();
