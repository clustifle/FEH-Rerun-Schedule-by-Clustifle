import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const config=JSON.parse(readFileSync(new URL('../polls-service/wrangler.jsonc',import.meta.url)));
const db=config.vars.SUPABASE_URL,worker='https://feh-community-polls.shyguyvn.workers.dev';
const headers={apikey:config.vars.SUPABASE_PUBLISHABLE_KEY,'Content-Type':'application/json'};
async function check(base,path,init,allowed){
 const r=await fetch(base+path,{...init,signal:AbortSignal.timeout(20000)});
 assert.ok(allowed.includes(r.status),path+' returned '+r.status);
 console.log(path+': '+r.status);return r;
}
for(const table of ['tracker_profiles','tracker_personal_tracking','tracker_managers','tracker_admin_history','tracker_watchlist','tracker_profile_moderation']){
 await check(db,'/rest/v1/'+table+'?select=*&limit=1',{headers},[401,403]);
}
for(const fn of ['list_tracker_managers','set_tracker_manager']){
 await check(db,'/rest/v1/rpc/'+fn,{method:'POST',headers,body:fn==='set_tracker_manager'?JSON.stringify({manager_email:'nobody@example.invalid',enabled:false}):'{}'},[401,403]);
}
await check(db,'/rest/v1/heroes?select=id&limit=1',{headers},[200]);
const role=await check(db,'/rest/v1/rpc/tracker_role',{method:'POST',headers,body:'{}'},[200]);assert.equal(await role.json(),null);
for(const path of ['/history','/polls?admin=1','/community/moderators','/community/moderation/history'])await check(worker,path,{},[401,403]);
for(const path of ['/auth/github?nonce='+'a'.repeat(64),'/auth/callback?state=old&code=old'])await check(worker,path,{},[400]);
await check(worker,'/polls',{},[200]);await check(worker,'/community/rules',{},[200]);
await check(worker,'/polls',{headers:{Origin:'https://untrusted.example'}},[403]);
await check(worker,'/community/hero-images',{method:'POST',headers:{'Content-Type':'image/webp'},body:'invalid'},[403]);
await check(worker,'/community/wiki-hero-import',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:'https://feheroes.fandom.com/wiki/Alm:_Saint-King'})},[403]);
await check(worker,'/community/connections',{},[401,405]);
console.log('Live anonymous access checks passed. No user records or credentials were printed.');
