import { env } from 'cloudflare:workers';
export function canEdit(request: Request) {
 const owner=(env as unknown as {TRACKER_OWNER_EMAIL?:string}).TRACKER_OWNER_EMAIL?.trim().toLowerCase();
 const email=request.headers.get('oai-authenticated-user-email')?.trim().toLowerCase();
 return !!owner && !!request.headers.get('oai-authenticated-user-id') && email===owner;
}
export function denyWrite(request:Request){return canEdit(request)?null:Response.json({error:'Only the site owner can edit this schedule.'},{status:403,headers:{'Cache-Control':'no-store'}});}
