import {denyWrite} from '@/lib/authorization';
import { importPortrait, PortraitImportError } from '@/lib/portrait-import';
export async function POST(request:Request) {
 const denied=denyWrite(request);if(denied)return denied;
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Invalid request origin'},{status:403});
 try {
  const {url}=await request.json() as {url?:unknown};
  if(typeof url!=='string')return Response.json({error:'Paste an image link.'},{status:400});
  const image=await importPortrait(url);
  return new Response(image.bytes as BodyInit,{headers:{'Content-Type':image.contentType,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 } catch(e) {
  if(e instanceof PortraitImportError)return Response.json({error:e.message},{status:400});
  console.error('Portrait import unavailable', e instanceof Error?e.name:'Unknown error');
  return Response.json({error:'Could not import this portrait. Try again, or upload the image file instead.'},{status:502});
 }
}
