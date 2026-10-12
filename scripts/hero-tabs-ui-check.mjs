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
 await page.goto('http://127.0.0.1:5196/FEH-Rerun-Schedule-by-Clustifle/all-heroes/');await page.getByRole('button',{name:'Add hero',exact:true}).click();const dialog=page.locator('dialog.hero-tabbed-editor[open]');await dialog.waitFor();
 await dialog.getByRole('button',{name:'Save hero',exact:true}).click();assert.equal(await dialog.getByRole('tab',{name:'Identity',exact:true}).getAttribute('aria-selected'),'true');await dialog.locator('[name=name]').fill('Tabbed Hero');await dialog.locator('[name=title]').fill('Preserved title');
 for(const width of [390,1280]){await page.setViewportSize({width,height:900});assert.ok(await dialog.getByRole('tablist').evaluate(e=>e.scrollWidth<=e.clientWidth+1));for(const tab of ['Portrait','Identity','Combat','Skills','Rerun']){await dialog.getByRole('tab',{name:tab,exact:true}).click();assert.equal(await dialog.locator('[data-hero-editor-panel]:visible').count(),1);assert.equal(await dialog.locator('[data-hero-editor-panel]:visible').getAttribute('data-hero-editor-panel'),tab);assert.ok(await dialog.evaluate(e=>e.scrollWidth<=e.clientWidth+1));for(const heading of await dialog.locator('h3:visible').all()){assert.equal(await heading.evaluate(e=>getComputedStyle(e).backgroundImage),'none');assert.equal(await heading.evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)');}}await dialog.getByRole('tab',{name:'Identity',exact:true}).click();assert.equal(await dialog.locator('[name=name]').inputValue(),'Tabbed Hero');assert.equal(await dialog.locator('[name=title]').inputValue(),'Preserved title');await dialog.getByRole('tab',{name:'Identity',exact:true}).focus();await page.keyboard.press('ArrowRight');assert.equal(await dialog.getByRole('tab',{name:'Combat',exact:true}).getAttribute('aria-selected'),'true');await dialog.getByRole('tab',{name:'Portrait',exact:true}).click();await page.screenshot({path:'hero-tabbed-'+width+'.png'});}
 await dialog.getByRole('tab',{name:'Skills',exact:true}).click();await dialog.getByRole('button',{name:'Add skill',exact:true}).click();await dialog.getByLabel('Skill name',{exact:true}).fill('Preserved skill draft');await dialog.getByRole('tab',{name:'Portrait',exact:true}).click();await dialog.getByRole('tab',{name:'Skills',exact:true}).click();assert.equal(await dialog.getByLabel('Skill name',{exact:true}).inputValue(),'Preserved skill draft');await dialog.getByRole('button',{name:'Cancel skill',exact:true}).click();assert.deepEqual(errors,[]);console.log('Tabbed Add/Edit Hero: five panels, field preservation, keyboard navigation, validation routing and desktop/mobile overflow passed.');
}finally{await browser.close()}