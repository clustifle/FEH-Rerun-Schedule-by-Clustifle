import {validateRefines} from '../lib/refine-board.ts';
import {readBoundedBody} from './request-body.mjs';
const error=(status,message)=>Object.assign(Error(message),{status});
export async function readRefines(env){const row=await env.DB.prepare('SELECT payload,revision,updated_at FROM refine_board WHERE id=1').bind().first();return {entries:row?JSON.parse(row.payload):[],revision:row?.revision||0,updatedAt:row?.updated_at||null};}
export async function saveRefines(request,env,u,rate){
 if(!u?.website_account||!u.website_id)throw error(401,'Sign in to your website account.');
 if(!['owner','manager'].includes(u.role))throw error(403,'Head Admin or Schedule Manager access is required.');
 if(request.method!=='POST')throw error(405,'Method not allowed.');
 await rate(env,'refines:'+u.website_id,10);
 const text=new TextDecoder().decode(await readBoundedBody(request,1000000,()=>{throw error(413,'Refine data is too large.')}));let b;try{b=JSON.parse(text)}catch{throw error(400,'Invalid refine data.')}
 if(!Number.isSafeInteger(b?.revision)||b.revision<0)throw error(400,'Reload the refine schedule before saving.');
 let entries;try{entries=validateRefines(b.entries)}catch(e){throw error(400,e.message)}
 const updatedAt=new Date().toISOString(),payload=JSON.stringify(entries);
 const query=b.revision===0?env.DB.prepare('INSERT OR IGNORE INTO refine_board(id,payload,revision,updated_at,updated_by) VALUES(1,?,1,?,?)').bind(payload,updatedAt,u.website_id):env.DB.prepare('UPDATE refine_board SET payload=?,revision=revision+1,updated_at=?,updated_by=? WHERE id=1 AND revision=?').bind(payload,updatedAt,u.website_id,b.revision);
 if(!(await query.run()).meta.changes)throw error(409,'The refine schedule changed on another device. Reload before saving; your edits are still open.');
 return {entries,revision:b.revision+1,updatedAt};
}
