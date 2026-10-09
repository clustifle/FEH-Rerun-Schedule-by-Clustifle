import {isBeta} from './beta';
if(isBeta){
 const original=window.fetch.bind(window);
 const readRpcs=new Set(['tracker_role','is_tracker_owner','list_tracker_managers','mods_list_users','get_public_tracker_profile','get_public_tracker_profile_by_username','search_public_tracker_profiles']);
 window.fetch=async(input,init)=>{
  const req=input instanceof Request?input:null,url=new URL(req?.url||String(input),location.href),method=(init?.method||req?.method||'GET').toUpperCase();
  if(!['GET','HEAD','OPTIONS'].includes(method)&&url.origin!==location.origin){
   const auth=url.origin==='https://aknsqeqykjgdyhdroqcx.supabase.co'&&url.pathname.startsWith('/auth/v1/');
   const readRpc=url.origin==='https://aknsqeqykjgdyhdroqcx.supabase.co'&&method==='POST'&&url.pathname.startsWith('/rest/v1/rpc/')&&readRpcs.has(url.pathname.split('/').at(-1)!);
   if(!auth&&!readRpc)return new Response(JSON.stringify({message:'Live editing is disabled in beta. Use the beta hero and version tools.',error:'Live editing is disabled in beta.'}),{status:403,headers:{'Content-Type':'application/json'}});
  }
  return original(input,init);
 };
}
