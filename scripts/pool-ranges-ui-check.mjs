import {chromium} from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {defaultSpecialRateRanges} from '../lib/special-rate-ranges.ts';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const base='http://127.0.0.1:5196/FEH-Rerun-Schedule-by-Clustifle/';
const make=(id,name,version,extra={})=>({id,name,title:'Test hero',category:'General',color:'Red',weapon_type:'Sword',move_type:'Infantry',pool:'General Pool',debut_version:version,release_date:'2024-07-01',schedule:'None',month:null,notes:'',portrait:'data/portraits/edfbaac5-3079-488c-b12e-c7b1333a5ee4.webp',...extra});
const heroes=[make('old','Old general','8.7'),make('new','New general','9.0'),make('season-old','Old seasonal','7.1',{category:'Special',pool:'Seasonal Limited'}),make('season-new','New seasonal','8.0',{category:'Special',pool:'Seasonal Limited'}),make('demote','Demote','9.0',{demote:true}),make('rearmed','Arcane hero','8.0',{category:'Rearmed',pool:'Non-Seasonal Limited'}),make('grail','Grail hero','7.0',{heroic_grail:true,pool:'Grail Pool'}),make('alfonse','Alfonse','1.0',{title:'Prince of Askr'})];
try{
 const p=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const user={id:'11111111-1111-4111-8111-111111111111',aud:'authenticated',role:'authenticated'},token='eyJhbGciOiJIUzI1NiJ9.'+Buffer.from(JSON.stringify({sub:user.id,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.signature';
 await p.addInitScript(({user,token})=>{localStorage.setItem('sb-aknsqeqykjgdyhdroqcx-auth-token',JSON.stringify({access_token:token,refresh_token:'test',expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user}));localStorage.setItem('feh-preferences',JSON.stringify({autoRefresh:false,carouselAutoplay:false}));},{user,token});
 await p.route('**/auth/v1/user',r=>r.fulfill({json:user}));
 await p.route('**/rest/v1/**',r=>{const path=new URL(r.request().url()).pathname;return r.fulfill({json:path.endsWith('tracker_role')?'Manager':path.endsWith('/heroes')?heroes:path.endsWith('tracker_feh_versions')?['1.0','7.1','8.1','8.7','9.1'].map((version,i)=>({version,sort_order:i,release_date:null})):[]});});
 let settings={ranges:structuredClone(defaultSpecialRateRanges),revision:0,updatedAt:null},failRead=false;
 await p.route('**/community/pool-ranges',async r=>{
  if(r.request().method()==='GET'){if(failRead)return r.fulfill({status:503,json:{error:'Test failure'}});return r.fulfill({json:settings});}
  const b=r.request().postDataJSON();if(b.revision!==settings.revision)return r.fulfill({status:409,json:{error:'Pool ranges changed since you opened them. Reload before saving.'}});
  settings={ranges:b.ranges,revision:settings.revision+1,updatedAt:new Date().toISOString()};return r.fulfill({json:settings});
 });
 await p.goto(base+'FEHRS_AdmManager/mods-edit/?tool=pool-ranges');await p.getByRole('heading',{name:'SR / SHSR version ranges',exact:true}).waitFor();
 const save=p.getByRole('button',{name:'Save pool ranges',exact:true});await p.waitForFunction(()=>!Array.from(document.querySelectorAll('button')).find(b=>b.textContent==='Save pool ranges').disabled);
 assert.equal(await p.getByLabel('SR last version',{exact:true}).inputValue(),'8.7');assert.equal(await p.getByLabel('SHSR last version',{exact:true}).inputValue(),'7.1');
 await p.getByLabel('SR first version',{exact:true}).fill('10.0');assert.ok(await save.isDisabled());await p.getByLabel('SR first version',{exact:true}).fill('1.0');
 await p.getByLabel('SR last version',{exact:true}).fill('9.1');await p.getByLabel('SHSR last version',{exact:true}).fill('8.1');
 assert.match(await p.getByLabel('Pool range preview').innerText(),/2 eligible for SR/);assert.match(await p.getByLabel('Pool range preview').innerText(),/2 eligible for SHSR/);await save.click();await p.getByText(/SR \/ SHSR ranges saved/).waitFor();assert.equal(settings.revision,1);
 for(const width of [1280,390,320]){await p.setViewportSize({width,height:900});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));if(width!==320)await p.screenshot({path:'pool-ranges-'+width+'.png'});}
 settings={...settings,revision:2};await p.getByLabel('SR last version',{exact:true}).fill('9.2');await save.click();await p.getByRole('alert').filter({hasText:'Pool ranges changed'}).waitFor();assert.equal(settings.ranges.sr.to,'9.1');await p.getByRole('button',{name:'Reload ranges',exact:true}).click();await p.waitForFunction(()=>!Array.from(document.querySelectorAll('button')).find(b=>b.textContent==='Save pool ranges').disabled);assert.equal(await p.getByLabel('SR last version',{exact:true}).inputValue(),'9.1');
 failRead=true;await p.getByRole('button',{name:'Reload ranges',exact:true}).click();await p.getByRole('alert').filter({hasText:'Could not load pool ranges'}).waitFor();assert.ok(await save.isDisabled());failRead=false;await p.getByRole('button',{name:'Reload ranges',exact:true}).click();await p.waitForFunction(()=>!Array.from(document.querySelectorAll('button')).find(b=>b.textContent==='Save pool ranges').disabled);
 await p.getByRole('button',{name:'Use default ranges',exact:true}).click();assert.equal(settings.ranges.sr.to,'9.1');assert.equal(await p.getByLabel('SR last version',{exact:true}).inputValue(),'8.7');
 await p.goto(base+'all-heroes/');await p.getByRole('combobox',{name:'Hero directory view'}).selectOption('details');
 const table=p.locator('.directory-table');await table.locator('tr').filter({hasText:'New general'}).getByText('General Pool (4★ SR)',{exact:true}).waitFor();await table.locator('tr').filter({hasText:'New seasonal'}).getByText('Seasonal Limited Pool (4★ SHSR)',{exact:true}).waitFor();assert.ok(!(await table.locator('tr').filter({hasText:'Demote'}).innerText()).includes('4★ SR'));
 assert.deepEqual(errors,[]);console.log('Admin ranges: Manager save, preview, invalid ranges, stale-save protection, failed-read safety, reset review, 320/390/1280 widths and updated main-site pool labels passed.');
}finally{await browser.close();}

