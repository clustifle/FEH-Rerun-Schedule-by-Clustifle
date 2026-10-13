import {chromium} from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const user={id:'11111111-1111-4111-8111-111111111111',aud:'authenticated',role:'authenticated'},token='eyJhbGciOiJIUzI1NiJ9.'+Buffer.from(JSON.stringify({sub:user.id,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.signature';
 await page.addInitScript(({user,token})=>{localStorage.setItem('sb-aknsqeqykjgdyhdroqcx-auth-token',JSON.stringify({access_token:token,refresh_token:'test',expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user}));localStorage.setItem('fehrs-admin-quickstart-seen:'+user.id,'1');},{user,token});
 const make=(id,name,extra={})=>({id,name,title:'Title '+name,portrait:'test.png',weapon_type:'Sword',move_type:'Infantry',debut_version:'1.0',release_date:'2017-02-02',category:'General',color:'Red',schedule:'None',month:null,notes:'',...extra});
 const heroes=[make('complete','Complete'),make('version','Version Missing',{debut_version:' '}),make('date','Date Missing',{release_date:null}),make('skills','Skills Missing'),make('blank','Blank Skills'),...Array.from({length:28},(_,i)=>make('extra'+i,'Extra '+i,{debut_version:null}))];
 let fail=false,offsets=[];
 await page.route('**/auth/v1/user',r=>r.fulfill({json:user}));
 await page.route('**/rest/v1/**',r=>{const url=new URL(r.request().url()),path=url.pathname;
  if(path.endsWith('tracker_role'))return r.fulfill({json:'Owner'});
  if(path.endsWith('/heroes'))return r.fulfill({json:heroes});
  if(path.endsWith('tracker_hero_skills')){
   if(fail)return r.fulfill({status:500,json:{message:'test failure'}});
   const offset=Number(url.searchParams.get('offset')||0);offsets.push(offset);
   return r.fulfill({json:offset===0?Array.from({length:1000},(_,i)=>({id:'row'+i,hero_id:i%2?'version':'date',name:'Recorded Skill'})):[{id:'last',hero_id:'complete',name:'Weapon'},{id:'empty',hero_id:'blank',name:' '}]});
  }
  return r.fulfill({json:[]});
 });
 const base='http://127.0.0.1:5196/FEH-Rerun-Schedule-by-Clustifle/FEHRS_AdmManager/dashboard/';
 await page.goto(base);const panel=page.locator('#adm-records-to-check');await panel.getByText('32 of 33 heroes match this check.',{exact:true}).waitFor();assert.ok(offsets.includes(1000));assert.equal(await panel.getByText('Complete',{exact:true}).count(),0);
 const filter=page.getByLabel('Missing detail');await filter.selectOption('Debut version');await panel.getByText('29 of 33 heroes match this check.',{exact:true}).waitFor();await panel.getByRole('button',{name:'Next',exact:true}).click();assert.equal(await panel.locator('li').count(),4);
 await filter.selectOption('Release date');assert.equal(await panel.locator('li').count(),1);assert.ok((await panel.locator('li').innerText()).includes('Date Missing'));
 await filter.selectOption('Skills');await panel.getByText('30 of 33 heroes match this check.',{exact:true}).waitFor();await panel.getByLabel('Find hero').fill('Blank');assert.equal(await panel.locator('li').count(),1);await panel.getByLabel('Find hero').fill('');await filter.selectOption('All');
 await page.screenshot({path:'admin-records-check.png'});
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:'admin-records-mobile-check.png'});
 fail=true;await panel.getByRole('button',{name:'Recheck skills'}).click();await panel.getByRole('alert').waitFor();assert.ok(await filter.locator('option[value="Skills"]').evaluate(e=>e.disabled));assert.equal(await panel.locator('li').filter({hasText:'Skills Missing'}).count(),0);
 fail=false;await panel.getByRole('button',{name:'Retry',exact:true}).click();await panel.getByText('32 of 33 heroes match this check.',{exact:true}).waitFor();
 await panel.getByLabel('Find hero').fill('Version Missing');await panel.getByRole('button',{name:'Edit Version Missing',exact:true}).click();await page.waitForURL(/editHero=version/);
 assert.deepEqual(errors,[]);console.log('Records checks: missing version/date/skills, blank skill names, complete heroes, paginated skill query/list, filters/search, failure/retry, mobile and main editor link passed.');
}finally{await browser.close();}
