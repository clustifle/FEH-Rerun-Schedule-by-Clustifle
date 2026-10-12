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
  if(url.pathname.includes('tracker_hero_skills')){
   if(r.request().method()==='DELETE'){
    deletes++;assert.equal(url.searchParams.get('revision'),'eq.1');const id=url.searchParams.get('id').replace('eq.','');
    if(mode==='error')return r.fulfill({status:403,json:{message:'Delete denied'}});
    if(mode==='stale')return r.fulfill({json:[]});
    data=rows.filter(s=>s.id===id);rows=rows.filter(s=>s.id!==id);
   }else data=rows;
  }else if(url.pathname.includes('tracker_role'))data='Owner';else if(url.pathname.includes('is_tracker_owner'))data=true;else if(url.pathname.includes('tracker_profiles')){if(mode==='error'&&url.searchParams.get('select')==='username,display_name')return r.fulfill({status:503,json:{message:'Network not ready'}});data=[{id:user.id,username:mode==='missing'?'':'testmember',display_name:'Test Member'}]}else if(url.pathname.includes('/heroes'))data=[hero];
  return r.fulfill({json:data});
 });
mode='error';await page.goto('http://127.0.0.1:5196/FEH-Rerun-Schedule-by-Clustifle/home');await page.getByText('Reconnecting to your account…',{exact:false}).waitFor();assert.equal(await page.locator('dialog.account-username-setup[open]').count(),0);mode='success';await page.getByText('Reconnecting to your account…',{exact:false}).waitFor({state:'hidden',timeout:15000});assert.equal(await page.locator('dialog.account-username-setup[open]').count(),0);
mode='missing';await page.evaluate(()=>window.dispatchEvent(new Event('owner-session-change')));const setup=page.getByRole('dialog',{name:'Set your username',exact:true});await setup.getByLabel('Username',{exact:true}).waitFor();mode='error';await page.evaluate(()=>window.dispatchEvent(new Event('owner-session-change')));await page.getByText('Reconnecting to your account…',{exact:false}).waitFor();await setup.waitFor({state:'hidden'});mode='success';await page.evaluate(()=>window.dispatchEvent(new Event('online')));await page.getByText('Reconnecting to your account…',{exact:false}).waitFor({state:'hidden'});assert.equal(await page.locator('dialog.account-username-setup[open]').count(),0);assert.deepEqual(errors,[]);console.log('Startup account check: transient failure stays non-blocking, automatic retry and online recovery work, confirmed missing username still prompts.');
}finally{await browser.close()}