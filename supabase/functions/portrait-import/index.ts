import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';
import {importPortrait,PortraitImportError} from './portrait-import.ts';
const allowedOrigin='https://clustifle.github.io';
const cors={'Access-Control-Allow-Origin':allowedOrigin,'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Vary':'Origin'};
Deno.serve(async(request:Request)=>{
 if(request.method==='OPTIONS')return new Response(null,{headers:cors});
 if(request.method!=='POST')return Response.json({error:'Method not allowed'},{status:405,headers:cors});
 if(request.headers.get('origin')!==allowedOrigin)return Response.json({error:'Invalid origin'},{status:403,headers:cors});
 try{
  const auth=request.headers.get('Authorization');if(!auth?.startsWith('Bearer '))return Response.json({error:'Owner sign-in required.'},{status:401,headers:cors});
  const client=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:auth}},auth:{persistSession:false}});
  const {data:{user},error:authError}=await client.auth.getUser();if(authError||!user)return Response.json({error:'Owner sign-in required.'},{status:401,headers:cors});
  const {data:owner,error}=await client.rpc('is_tracker_owner');if(error||owner!==true)return Response.json({error:'Only the owner can import portraits.'},{status:403,headers:cors});
  const {url}=await request.json();if(typeof url!=='string')throw new PortraitImportError('Paste an image link.');
  const image=await importPortrait(url);
  return new Response(image.bytes as BodyInit,{headers:{...cors,'Content-Type':image.contentType,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 }catch(e){return Response.json({error:e instanceof PortraitImportError?e.message:'Could not import this image. Upload a file instead.'},{status:400,headers:cors});}
});
