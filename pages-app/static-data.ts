import {createClient} from '@supabase/supabase-js';
export const supabase=createClient('https://aknsqeqykjgdyhdroqcx.supabase.co','sb_publishable_PiJIst1aSJtrYBiIvwDIVA_KS3c-E3g');
export const assetUrl=(value:string)=>import.meta.env.BASE_URL+value.replace(/^\//,'');
export const portraitUrl=(value:string)=>value.startsWith('data/')?assetUrl(value):supabase.storage.from('portraits').getPublicUrl(value).data.publicUrl;
export async function ownerSession(){const {data:{session}}=await supabase.auth.getSession();if(!session)return false;const {data,error}=await supabase.rpc('is_tracker_owner');return !error&&data===true;}
const fail=(error:unknown,status=400)=>Response.json({error:error instanceof Error?error.message:String(error)},{status});
function portraitCandidates(value:string){
 const url=new URL(value.trim());const host=url.hostname.toLowerCase();
 if(url.protocol!=='https:'||url.username||url.password||(url.port&&url.port!=='443')||!(host==='wikia.nocookie.net'||host.endsWith('.wikia.nocookie.net')||host==='cdn.wikimg.net'||host==='upload.wikimedia.org'))throw new Error('Use a direct HTTPS image link from FEH Wiki, Fandom/Wikia, or Wikimedia.');
 const candidates=[url.href];
 if(host==='wikia.nocookie.net'||host.endsWith('.wikia.nocookie.net')){const canonical=new URL(url.href);canonical.hostname='static.wikia.nocookie.net';candidates.push(canonical.href);canonical.pathname=canonical.pathname.split('/revision/')[0];canonical.search='';candidates.push(canonical.href);}
 return [...new Set(candidates)];
}
async function browserPortrait(url:string){
 const response=await fetch(url,{credentials:'omit',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw new Error('Image host returned '+response.status);
 if(Number(response.headers.get('content-length')||0)>3145728)throw new Error('Choose a portrait under 3 MB.');
 const reader=response.body?.getReader();if(!reader)throw new Error('Empty portrait');
 const chunks:Uint8Array[]=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>3145728){await reader.cancel();throw new Error('Choose a portrait under 3 MB.');}chunks.push(value);}}finally{reader.releaseLock();}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
 const png=bytes.length>=8&&bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71&&bytes[4]===13&&bytes[5]===10&&bytes[6]===26&&bytes[7]===10;
 const jpg=bytes.length>=3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
 const webp=bytes.length>=12&&String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';
 if(!png&&!jpg&&!webp)throw new Error('The link must contain a PNG, JPG, or WebP image.');
 return new Blob([bytes],{type:png?'image/png':jpg?'image/jpeg':'image/webp'});
}
async function importImage(url:string){
 const candidates=portraitCandidates(url);
 const {data:{session}}=await supabase.auth.getSession();
 if(!session)throw new Error('Sign in as the owner first.');
 const response=await fetch('https://aknsqeqykjgdyhdroqcx.supabase.co/functions/v1/portrait-import',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+session.access_token},body:JSON.stringify({url})});
 if(response.ok)return response.blob();
 const d=await response.json();
 if(response.status===401||response.status===403)throw new Error(d.error||'Owner sign-in required.');
 for(const candidate of candidates){try{return await browserPortrait(candidate);}catch{/* Try the canonical wiki URL if the legacy host fails. */}}
 throw new Error(d.error||'Could not import portrait. Check the direct image link.');
}
export async function apiFetch(input:string,init?:RequestInit){
 try{
  if(input==='/api/session'){const {data:role}=await supabase.rpc('tracker_role');return Response.json({canEdit:role==='Owner'||role==='Manager',role});}
  if(input==='/api/heroes'&&(!init?.method||init.method==='GET')){
   const {data,error}=await supabase.from('heroes').select('*').order('month',{nullsFirst:false}).order('name');
   if(error)throw new Error('Schedule unavailable. '+error.message);
   return Response.json(data);
  }
  if(!await ownerSession())return fail('Only the owner can edit the schedule.',403);
  if(input==='/api/portrait-import'){
   const body=JSON.parse(String(init?.body));const blob=await importImage(body.url);
   return new Response(blob,{headers:{'Content-Type':blob.type}});
  }
  if(input==='/api/heroes'&&init?.method==='DELETE'){
   const {id}=JSON.parse(String(init.body));const {data:old,error:readError}=await supabase.from('heroes').select('portrait').eq('id',id).single();if(readError)throw new Error(readError.message);
   const {error}=await supabase.from('heroes').delete().eq('id',id);if(error)throw new Error(error.message);
   if(old.portrait&&!old.portrait.startsWith('data/'))await supabase.storage.from('portraits').remove([old.portrait]);
   return Response.json({ok:true});
  }
  if(input==='/api/heroes'&&init?.method==='POST'){
   const form=init.body as FormData;const id=String(form.get('id')||crypto.randomUUID());
   const {data:old,error:readError}=await supabase.from('heroes').select('portrait').eq('id',id).maybeSingle();if(readError)throw new Error(readError.message);
   let portrait=old?.portrait||null;let file=form.get('portrait');let uploaded:string|null=null;
   const link=String(form.get('portraitUrl')||'').trim();
   if(link&&!(file instanceof File&&file.size)){const blob=await importImage(link);file=new File([blob],'portrait',{type:blob.type});}
   if(file instanceof File&&file.size){
    if(file.size>3145728||!['image/png','image/jpeg','image/webp'].includes(file.type))throw new Error('Choose PNG, JPG, or WebP under 3 MB.');
    const bytes=new Uint8Array(await file.arrayBuffer());const valid=file.type==='image/png'?bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71:file.type==='image/jpeg'?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';if(!valid)throw new Error('Invalid portrait image.');
    uploaded=crypto.randomUUID()+'.'+(file.type==='image/png'?'png':file.type==='image/jpeg'?'jpg':'webp');
    const {error}=await supabase.storage.from('portraits').upload(uploaded,file,{contentType:file.type});if(error)throw new Error(error.message);portrait=uploaded;
   }
   const row={id,name:String(form.get('name')||'').trim(),title:String(form.get('title')||'').trim(),category:String(form.get('category')),schedule:form.get('status')==='Unknown'?'Waitlist':String(form.get('schedule')),color:String(form.get('color')),status:String(form.get('status')),pool:form.get('category')==='General'?'General Pool':'Limited Pool',month:form.get('schedule')==='Waitlist'||form.get('status')==='Unknown'?null:String(form.get('month')||'')||null,blessing:!['Legendary','Mythic','Chosen Hero'].includes(String(form.get('category')))?null:String(form.get('blessing')||'')||null,notes:String(form.get('notes')||'').trim(),portrait,updated:new Date().toISOString()};
   const {error}=await supabase.from('heroes').upsert(row);
   if(error){if(uploaded)await supabase.storage.from('portraits').remove([uploaded]);throw new Error(error.message);}
   if(uploaded&&old?.portrait&&!old.portrait.startsWith('data/'))await supabase.storage.from('portraits').remove([old.portrait]);
   return Response.json({ok:true});
  }
  return fail('Unknown operation',404);
 }catch(error){return fail(error);}
}
