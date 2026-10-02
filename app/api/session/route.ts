import {canEdit} from '@/lib/authorization';
export const dynamic='force-dynamic';
export async function GET(request:Request){return Response.json({canEdit:canEdit(request)},{headers:{'Cache-Control':'private, no-store','Vary':'Cookie'}});}
