import {validateHero} from './hero-validation.mjs';
export {validateHero} from './hero-validation.mjs';
const json=(v,s=200)=>new Response(JSON.stringify(v),{status:s,headers:{'Content-Type':'application/json','Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'}});
const uuid=/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
const weapons={Red:['Sword','Beast','Bow','Breath','Dagger','Tome'],Blue:['Lance','Beast','Bow','Breath','Dagger','Tome'],Green:['Axe','Beast','Bow','Breath','Dagger','Tome'],Colorless:['Staff','Beast','Bow','Breath','Dagger','Tome']};
const schedules=['None','General','Remix','Monthly Revival','Forging Bonds Revival','Hall of Forms Revival','Waitlist','DSH Waitlist','NHR Waitlist','Remix Waitlist'];
const fields=['name','title','category','pool','color','weapon_type','move_type','schedule','month','notes','blessing','demote','heroic_grail','debut_version','release_date','release_event'];
async function body(request){const text=await request.text();if(text.length>500000)throw Error('Too many changes in one request.');return JSON.parse(text);}
export async function handleData(request,env,owner){
 try{
 const path=new URL(request.url).pathname.slice('/_beta/api/'.length),db=env.DB;
 if(!db)return json({error:'Beta database is not configured.'},503);
 const heroes=async()=>((await db.prepare('SELECT record, revision FROM beta_heroes ORDER BY id').all()).results||[]).map(r=>({...JSON.parse(r.record),revision:r.revision}));
 const versions=async()=>(await db.prepare('SELECT * FROM beta_versions ORDER BY sort_order,version').all()).results||[];
 if(path==='heroes'&&request.method==='GET')return json(await heroes());
 if(path==='versions'&&request.method==='GET'){const all=await heroes();return json((await versions()).map(v=>({...v,hero_count:all.filter(h=>h.debut_version===v.version).length})));}
 if(path==='versions'&&request.method==='POST'){
  const b=await body(request);if(!/^\d{1,2}\.(?:0|[1-9]\d?)$/.test(b.version)||!Number.isSafeInteger(b.sort_order)||b.sort_order<0||b.sort_order>100000)throw Error('Use a version such as 10.1 and a valid order.');
  if(b.release_date&&(!/^\d{4}-\d{2}-\d{2}$/.test(b.release_date)||new Date(b.release_date).toISOString().slice(0,10)!==b.release_date))throw Error('Choose a valid release date.');
  const old=b.original_version||b.version,known=await versions();
  if(b.original_version&&!known.some(v=>v.version===old))throw Error('Version no longer exists. Refresh and try again.');
  if(old!==b.version&&known.some(v=>v.version===b.version))throw Error('That version already exists.');
  const statements=[db.prepare('INSERT INTO beta_versions(version,release_date,sort_order) VALUES(?,?,?) ON CONFLICT(version) DO UPDATE SET release_date=excluded.release_date,sort_order=excluded.sort_order').bind(b.version,b.release_date||null,b.sort_order)];
  if(old!==b.version)statements.push(db.prepare("UPDATE beta_heroes SET record=json_set(record,'$.debut_version',?),revision=revision+1 WHERE json_extract(record,'$.debut_version')=?").bind(b.version,old),db.prepare('DELETE FROM beta_versions WHERE version=?').bind(old));
  statements.push(db.prepare('INSERT INTO beta_history VALUES(?,?,?,?,?,?)').bind(crypto.randomUUID(),owner,new Date().toISOString(),'Saved FEH version '+b.version,JSON.stringify(known.filter(v=>v.version===old)),JSON.stringify([{version:b.version,release_date:b.release_date||null,sort_order:b.sort_order}])));
  await db.batch(statements);return json({ok:true});
 }
 if(path==='versions'&&request.method==='DELETE'){
  const b=await body(request),known=await versions();if(!known.some(v=>v.version===b.version))throw Error('Version no longer exists.');
  if(Object.hasOwn(b,'replacement')&&b.replacement!==null&&(!known.some(v=>v.version===b.replacement)||b.replacement===b.version))throw Error('Choose a different replacement version.');
  const assertion=crypto.randomUUID(),statements=[];
  if(!Object.hasOwn(b,'replacement')){
   if((await heroes()).some(h=>h.debut_version===b.version))throw Error('Reassign heroes using this version before deleting it.');
   statements.push(db.prepare("INSERT INTO beta_assertions(id,valid) SELECT ?,CASE WHEN EXISTS(SELECT 1 FROM beta_heroes WHERE json_extract(record,'$.debut_version')=?) THEN 0 ELSE 1 END").bind(assertion,b.version));
  }else statements.push(db.prepare("UPDATE beta_heroes SET record=json_set(record,'$.debut_version',?),revision=revision+1 WHERE json_extract(record,'$.debut_version')=?").bind(b.replacement,b.version));
  statements.push(db.prepare('DELETE FROM beta_versions WHERE version=?').bind(b.version),db.prepare('INSERT INTO beta_history VALUES(?,?,?,?,?,?)').bind(crypto.randomUUID(),owner,new Date().toISOString(),'Deleted FEH version '+b.version,JSON.stringify(known.filter(v=>v.version===b.version)),JSON.stringify({replacement:b.replacement})),db.prepare('DELETE FROM beta_assertions WHERE id=?').bind(assertion));
  await db.batch(statements);return json({ok:true});
 }
 if(path==='bulk'&&request.method==='POST'){
  const b=await body(request),all=await heroes(),known=(await versions()).map(v=>v.version);
  if(!Array.isArray(b.ids)||!b.ids.length||b.ids.length>500||new Set(b.ids).size!==b.ids.length||!b.changes||typeof b.changes!=='object'||Array.isArray(b.changes)||!Object.keys(b.changes).length||Object.keys(b.changes).some(k=>!fields.includes(k)))throw Error('Select heroes and the fields to update.');
  const before=b.ids.map(id=>{const h=all.find(h=>h.id===id);if(!h)throw Error('A selected hero no longer exists.');if(b.revisions?.[id]!==h.revision)throw Error('A hero changed since preview. Refresh and review again.');return h;});
  const after=before.map(h=>validateHero({...h,...b.changes,updated:new Date().toISOString()},known));
  // One D1 batch transaction: all selected heroes and the audit entry succeed together.
  const assertionId=crypto.randomUUID();
  const statements=before.map((h,i)=>db.prepare('INSERT INTO beta_assertions(id,valid) SELECT ?,CASE WHEN EXISTS(SELECT 1 FROM beta_heroes WHERE id=? AND revision=?) THEN 1 ELSE 0 END').bind(assertionId+'-'+i,h.id,h.revision));
  statements.push(...after.map(h=>db.prepare('UPDATE beta_heroes SET record=?,revision=revision+1 WHERE id=? AND revision=?').bind(JSON.stringify(h),h.id,h.revision)));
  statements.push(db.prepare('INSERT INTO beta_history VALUES(?,?,?,?,?,?)').bind(crypto.randomUUID(),owner,new Date().toISOString(),'Updated '+after.length+' heroes',JSON.stringify(before),JSON.stringify(after)));
  statements.push(db.prepare('DELETE FROM beta_assertions WHERE id LIKE ?').bind(assertionId+'-%'));
  await db.batch(statements);return json({ok:true,count:after.length});
 }
 if(path==='hero'&&request.method==='POST'){
  const b=await body(request),all=await heroes(),old=b.id?all.find(h=>h.id===b.id):null;
  if(b.id&&!old)throw Error('Hero no longer exists.');
  const selected=Object.fromEntries(fields.filter(k=>Object.hasOwn(b,k)).map(k=>[k,b[k]]));
  const h=validateHero({...old,id:old?.id||crypto.randomUUID(),name:'',title:'',category:'General',pool:'General Pool',color:'Red',weapon_type:null,move_type:null,schedule:'None',month:null,notes:'',blessing:null,demote:false,heroic_grail:false,portrait:null,...old,...selected,updated:new Date().toISOString()},(await versions()).map(v=>v.version));
  if(old&&b.revision!==old.revision)throw Error('This hero changed. Refresh before saving.');
  const assertionId=crypto.randomUUID(),statements=[];
  if(old)statements.push(db.prepare('INSERT INTO beta_assertions(id,valid) SELECT ?,CASE WHEN EXISTS(SELECT 1 FROM beta_heroes WHERE id=? AND revision=?) THEN 1 ELSE 0 END').bind(assertionId,old.id,old.revision));
  statements.push(db.prepare('INSERT INTO beta_heroes(id,record) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET record=excluded.record,revision=beta_heroes.revision+1').bind(h.id,JSON.stringify(h)),db.prepare('INSERT INTO beta_history VALUES(?,?,?,?,?,?)').bind(crypto.randomUUID(),owner,new Date().toISOString(),old?'Edited hero':'Added hero',JSON.stringify(old?[old]:[]),JSON.stringify([h])));
  if(old)statements.push(db.prepare('DELETE FROM beta_assertions WHERE id=?').bind(assertionId));
  await db.batch(statements);return json({ok:true,id:h.id});
 }
 if(path==='hero'&&request.method==='DELETE'){
  const b=await body(request),h=(await heroes()).find(h=>h.id===b.id);if(!h)throw Error('Hero no longer exists.');
  await db.batch([db.prepare('DELETE FROM beta_heroes WHERE id=?').bind(h.id),db.prepare('INSERT INTO beta_history VALUES(?,?,?,?,?,?)').bind(crypto.randomUUID(),owner,new Date().toISOString(),'Deleted beta hero',JSON.stringify([h]),'[]')]);return json({ok:true});
 }
 if(path==='watchlist'&&request.method==='GET')return json((await db.prepare('SELECT hero_id,list_name FROM beta_watchlist WHERE user_id=?').bind(owner).all()).results||[]);
 if(path==='watchlist'&&request.method==='POST'){
  const b=await body(request);if(!uuid.test(b.hero_id)||typeof b.follow!=='boolean'||typeof b.list_name!=='string'||!b.list_name.trim()||b.list_name.length>60)throw Error('Choose a hero and list name.');
  if(b.follow)await db.prepare('INSERT INTO beta_watchlist VALUES(?,?,?) ON CONFLICT(user_id,hero_id) DO UPDATE SET list_name=excluded.list_name').bind(owner,b.hero_id,b.list_name.trim()).run();else await db.prepare('DELETE FROM beta_watchlist WHERE user_id=? AND hero_id=?').bind(owner,b.hero_id).run();return json({ok:true});
 }
 if(path==='history'&&request.method==='GET')return json((await db.prepare('SELECT id,label,created_at,before_json,after_json FROM beta_history ORDER BY created_at DESC LIMIT 100').all()).results||[]);
 return json({error:'Unknown beta operation.'},404);
 }catch(error){const message=error instanceof Error?error.message:'Could not save beta data.';return json({error:message.includes('CHECK constraint')?'A hero changed since preview. Refresh and review again.':message},400);}
}
