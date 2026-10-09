import {supabase} from './static-data';
import {validateHero} from '../beta-service/hero-validation.mjs';
import type {BetaHero} from './V2Workspace';

async function result<T>(request:PromiseLike<{data:T;error:{message:string}|null}>){const {data,error}=await request;if(error)throw Error(error.message);return data as NonNullable<T>;}
export async function productionRequest(path:string,init?:RequestInit){
 const read=!init?.method||init.method==='GET';
 const body=init?.body?JSON.parse(String(init.body)):{};
 if(path==='heroes'&&read)return result(supabase.from('heroes').select('*').order('name'));
 if(path==='versions'&&read){
  const [versions,heroes]=await Promise.all([result(supabase.from('tracker_feh_versions').select('*').order('sort_order').order('version')),result(supabase.from('heroes').select('debut_version'))]);
  return versions.map(v=>({...v,hero_count:heroes.filter(h=>h.debut_version===v.version).length}));
 }
 if(path==='watchlist'){
  const {data:{session}}=await supabase.auth.getSession();
  if(!session){if(read)return [];throw Error('Sign in to save heroes to your watchlist.');}
  if(read)return result(supabase.from('tracker_watchlist').select('hero_id,list_name').eq('user_id',session.user.id));
  if(body.follow)await result(supabase.from('tracker_watchlist').upsert({user_id:session.user.id,hero_id:body.hero_id,list_name:body.list_name},{onConflict:'user_id,hero_id'}));
  else await result(supabase.from('tracker_watchlist').delete().eq('user_id',session.user.id).eq('hero_id',body.hero_id));
  return {ok:true};
 }
 if(path==='versions'||path==='version-bulk')return result(supabase.rpc('tracker_v2_versions',{payload:body,operation:path==='version-bulk'?'bulk':init?.method==='DELETE'?'delete':'save'}));
 if(path==='bulk'||path==='hero'){
  const versions=await result(supabase.from('tracker_feh_versions').select('version'));
  let records:BetaHero[];
  if(path==='bulk'){
   if(!Array.isArray(body.ids)||!body.ids.length||body.ids.length>500)throw Error('Choose 1–500 heroes.');
   const heroes=await result(supabase.from('heroes').select('*').in('id',body.ids));
   if(heroes.length!==body.ids.length)throw Error('Refresh your hero selection.');
   records=heroes.map(h=>({...h,...body.changes,id:h.id,revision:body.revisions[h.id]}));
  }else{
   const existing=body.id?await result(supabase.from('heroes').select('*').eq('id',body.id).single()):null;
   records=[{...existing,...body,id:existing?.id||crypto.randomUUID(),notes:body.notes||'',title:body.title||'',demote:!!body.demote,heroic_grail:!!body.heroic_grail}];
  }
  for(const h of records)validateHero(h,versions.map(v=>v.version));
  return result(supabase.rpc('tracker_v2_save_heroes',{records}));
 }
 throw Error('This management action is unavailable.');
}
