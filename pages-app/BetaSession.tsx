import {useEffect} from 'react';
import {supabase} from './static-data';
import {isBeta} from './beta';
export default function BetaSession(){
 useEffect(()=>{if(!isBeta)return;
  async function sync(){const {data:{session}}=await supabase.auth.getSession();if(!session){await fetch('/_beta/session',{method:'DELETE'});location.replace('/');return;}const r=await fetch('/_beta/session',{method:'POST',headers:{Authorization:'Bearer '+session.access_token}});if(!r.ok)location.replace('/');}
  void sync();const timer=setInterval(()=>void sync(),300000);const {data:{subscription}}=supabase.auth.onAuthStateChange(()=>setTimeout(()=>void sync(),0));
  return()=>{clearInterval(timer);subscription.unsubscribe();};
 },[]);return null;
}
