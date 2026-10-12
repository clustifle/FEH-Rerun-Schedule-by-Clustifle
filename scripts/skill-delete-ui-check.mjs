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
  }else if(url.pathname.includes('tracker_role'))data='Owner';else if(url.pathname.includes('is_tracker_owner'))data=true;else if(url.pathname.includes('tracker_profiles'))data=[{id:user.id,username:'testmember',display_name:'Test Member'}];else if(url.pathname.includes('/heroes'))data=[hero];
  return r.fulfill({json:data});
 });
 await page.goto('http://127.0.0.1:5196/FEH-Rerun-Schedule-by-Clustifle/skills');
 await page.getByRole('button',{name:'Delete test',exact:true}).waitFor();assert.equal(await page.locator('.skills-directory-card').count(),1);
 const dialog=page.locator('dialog.skill-delete-dialog[open]');
 for(const width of [390,1280]){
  await page.setViewportSize({width,height:900});assert.equal(await page.locator('.skills-directory-grid .skill-description').count(),0);assert.ok((await page.locator('.skills-directory-grid').innerText()).includes('Delete test'));await page.getByRole('button',{name:'Delete test',exact:true}).focus();await page.keyboard.press('Enter');const details=page.locator('dialog.skill-details-dialog[open]');await details.getByRole('heading',{name:'Delete test',exact:true}).waitFor();assert.equal(await details.locator('.skill-description').count(),0);assert.ok(await details.evaluate(e=>e.scrollWidth<=e.clientWidth+1));await page.keyboard.press('Escape');await details.waitFor({state:'hidden'});await page.getByRole('button',{name:'Delete test',exact:true}).click();await page.getByRole('button',{name:'Delete skill',exact:true}).click();
  await dialog.waitFor();assert.ok(await dialog.evaluate(e=>e.scrollWidth<=e.clientWidth+1));assert.equal(await dialog.getByRole('option').count(),2);
  await dialog.getByRole('button',{name:'Cancel',exact:true}).click();await dialog.waitFor({state:'hidden'});assert.equal(deletes,0);
 }
 await page.getByRole('button',{name:'Delete test',exact:true}).click();await page.getByRole('button',{name:'Delete skill',exact:true}).click();await dialog.getByLabel('Skill record to delete').selectOption('unit');
 await dialog.getByText('This removes the skill from this unit’s profile.',{exact:false}).waitFor();mode='error';
 await dialog.getByRole('button',{name:'Delete skill permanently',exact:true}).click();await dialog.getByRole('alert').getByText('Delete denied',{exact:true}).waitFor();assert.equal(rows.length,2);
 mode='stale';await dialog.getByRole('button',{name:'Delete skill permanently',exact:true}).click();await dialog.getByRole('alert').getByText('This skill changed or could not be deleted. Reload Skills List and try again.',{exact:true}).waitFor();assert.equal(rows.length,2);
 mode='success';await dialog.getByRole('button',{name:'Delete skill permanently',exact:true}).click();await dialog.waitFor({state:'hidden'});assert.deepEqual(rows.map(s=>s.id),['shared']);assert.equal(await page.locator('.skills-directory-card').count(),1);
 await page.getByRole('button',{name:'Delete test',exact:true}).click();await page.getByRole('button',{name:'Delete skill',exact:true}).click();await dialog.getByRole('button',{name:'Delete skill permanently',exact:true}).click();await dialog.waitFor({state:'hidden'});assert.equal(rows.length,0);await page.getByText('No skills recorded yet.',{exact:true}).waitFor();assert.deepEqual(errors,[]);
 console.log('Delete Skills List: desktop/mobile confirmation, cancel, record selection, failure, revision conflict, and scoped deletion passed.');
}finally{await browser.close()}
