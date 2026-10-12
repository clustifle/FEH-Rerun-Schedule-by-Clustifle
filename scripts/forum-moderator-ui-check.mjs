import {chromium} from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const hero={id:'00000000-0000-4000-8000-000000000001',name:'Test Hero',title:'Test Title',category:'General',color:'Red',portrait:null,schedule:'None',pool:'General Pool',month:null,notes:'',demote:false,revision:1};
 const baseSkill={slot:'Special',family:'Test',name:'Delete test',tier:null,description:'Test effect',refined:false,remix:false,icon_url:null,sp:200,rarity:'',prerequisites:'',restrictions:'',source_url:'',revision:1};
 let rows=[{...baseSkill,id:'shared',hero_id:null},{...baseSkill,id:'unit',hero_id:hero.id}],mode='success',deletes=0;
 const user={id:'11111111-1111-4111-8111-111111111111',aud:'authenticated',role:'authenticated'},token='eyJhbGciOiJIUzI1NiJ9.'+Buffer.from(JSON.stringify({sub:user.id,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.signature';
 await page.addInitScript(({user,token})=>localStorage.setItem('sb-aknsqeqykjgdyhdroqcx-auth-token',JSON.stringify({access_token:token,refresh_token:'test',expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user})),{user,token});
 await page.route('**/auth/v1/user',r=>r.fulfill({json:user}));
 await page.route('**/rest/v1/**',r=>{
  const url=new URL(r.request().url());let data=[];
  if(url.pathname.includes('mods_forum_accounts'))data=[{github_id:'456',website_id:'new-user',login:'newmember'}];else if(url.pathname.includes('tracker_hero_skills')){
   if(r.request().method()==='DELETE'){
    deletes++;assert.equal(url.searchParams.get('revision'),'eq.1');const id=url.searchParams.get('id').replace('eq.','');
    if(mode==='error')return r.fulfill({status:403,json:{message:'Delete denied'}});
    if(mode==='stale')return r.fulfill({json:[]});
    data=rows.filter(s=>s.id===id);rows=rows.filter(s=>s.id!==id);
   }else data=rows;
  }else if(url.pathname.includes('tracker_role'))data='Owner';else if(url.pathname.includes('is_tracker_owner'))data=true;else if(url.pathname.includes('tracker_profiles'))data=[{id:user.id,username:'testmember',display_name:'Test Member'}];else if(url.pathname.includes('/heroes'))data=[hero];
  return r.fulfill({json:data});
 });
 let mods=[];await page.route('**/community/moderators',r=>{if(r.request().method()==='POST'){const b=r.request().postDataJSON();assert.equal(b.githubId,'456');mods=b.enabled?[{github_id:'456',login:'newmember',moderator:1}]:[];return r.fulfill({json:{ok:true}})}return r.fulfill({json:{users:mods}})});
 await page.goto('http://127.0.0.1:5196/FEH-Rerun-Schedule-by-Clustifle/FEHRS_AdmManager/staff/');
 await page.getByText('Forum Moderators',{exact:true}).click();const select=page.getByLabel('Forum moderator account');await select.selectOption('456');await page.getByRole('button',{name:'Make forum mods',exact:true}).click();await page.getByRole('button',{name:'Remove moderator',exact:true}).waitFor();assert.equal(mods.length,1);await page.getByRole('button',{name:'Remove moderator',exact:true}).click();await page.getByRole('button',{name:'Make forum mods',exact:true}).waitFor();assert.equal(mods.length,0);assert.deepEqual(errors,[]);console.log('Staff and Roles: select registered user, assign and remove Forum Moderator passed.');
}finally{await browser.close()}