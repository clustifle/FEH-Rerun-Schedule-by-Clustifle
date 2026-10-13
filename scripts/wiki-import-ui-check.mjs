import {chromium} from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const wiki=JSON.parse((await readFile(process.env.WIKI_FIXTURE||'tests/fixtures/alm-wiki-import.json','utf8')).replace(/^\uFEFF/,''));
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[],writes=[];page.on('pageerror',e=>errors.push(e.message));
 const id='11111111-1111-4111-8111-111111111111',user={id,aud:'authenticated',role:'authenticated'},token='eyJhbGciOiJIUzI1NiJ9.'+Buffer.from(JSON.stringify({sub:id,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.signature';
 const hero={id,name:'Alm',title:'Saint-King',debut_version:null,release_date:null,portrait:'test.png',weapon_type:'Bow',move_type:'Infantry',category:'Legendary',color:'Colorless',blessing:'Earth',revision:1},skills=[{id:'weapon',hero_id:id,slot:'Weapon',name:'Luna Arc',family:'Luna Arc',revision:1}];
 let mismatch=false,changed=false,databaseFailure=false;hero.category='Rearmed';
 await page.addInitScript(({user,token})=>{localStorage.setItem('sb-aknsqeqykjgdyhdroqcx-auth-token',JSON.stringify({access_token:token,refresh_token:'test',expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user}));localStorage.setItem('fehrs-admin-quickstart-seen:'+user.id,'1');},{user,token});
 await page.route('**/auth/v1/user',r=>r.fulfill({json:user}));
 await page.route('https://feheroes.fandom.com/api.php?**',r=>r.fulfill({json:{parse:{...wiki.parse,title:mismatch?'Alm: Hero of Prophecy':wiki.parse.title}}}));
 await page.route('**/rest/v1/**',r=>{const path=new URL(r.request().url()).pathname;
  if(path.endsWith('tracker_role'))return r.fulfill({json:'Owner'});
  if(path.endsWith('tracker_v2_save_heroes')){const payload=r.request().postDataJSON();writes.push(payload);Object.assign(hero,payload.records[0],{revision:2});return r.fulfill({json:{count:1}});}
  if(path.endsWith('/heroes'))return r.fulfill({json:r.request().headers().accept?.includes('object')?{...hero,revision:changed?99:hero.revision}:[hero]});
  if(path.endsWith('tracker_feh_versions'))return r.fulfill({json:[{version:'3.4'}]});
  if(path.endsWith('tracker_hero_skills')){if(r.request().method()==='POST'){if(databaseFailure)return r.fulfill({status:400,json:{message:'Skill save denied for test.',code:'23514'}});const payload=r.request().postDataJSON();for(const skill of payload)if(skill.icon_url)assert.match(skill.icon_url,/^https:\/\/feh-community-polls[.]shyguyvn[.]workers[.]dev\/community\/images\/[a-f0-9-]{36}$/);writes.push(payload);skills.push(...payload);return r.fulfill({status:201,json:payload});}return r.fulfill({json:skills});}
  return r.fulfill({json:[]});
 });
 let upload=0,iconFailure=true;
 await page.route('https://static.wikia.nocookie.net/**',r=>iconFailure?r.fulfill({status:404,body:'missing'}):r.fulfill({path:'public/skill-slots/a_passive.png',contentType:'image/png'}));
 await page.route('**/community/hero-image-import',r=>iconFailure?r.fulfill({status:400,json:{error:'Could not fetch this image.'}}):r.fulfill({path:'public/skill-slots/a_passive.png',contentType:'image/png'}));
 await page.route('**/community/hero-images',r=>r.fulfill({json:{url:'https://feh-community-polls.shyguyvn.workers.dev/community/images/22222222-2222-4222-8222-'+String(++upload).padStart(12,'0')+'?media=2'}}));
 await page.goto('http://127.0.0.1:5196/FEH-Rerun-Schedule-by-Clustifle/FEHRS_AdmManager/dashboard/');
 await page.getByRole('button',{name:'Import wiki info for Alm',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Import from FEH Wiki'});
 mismatch=true;await dialog.getByRole('button',{name:'Refresh preview'}).click();await dialog.getByRole('alert').waitFor();assert.ok((await dialog.getByRole('alert').innerText()).includes('different hero'));
 mismatch=false;await dialog.getByRole('button',{name:'Refresh preview'}).click();await dialog.getByRole('button',{name:'Merge selected info'}).waitFor();
 assert.equal(await dialog.getByRole('img',{name:'Rearmed weapon',exact:true}).count(),1);await dialog.getByRole('checkbox',{name:'Refine Luna Arc',exact:true}).check();assert.equal(await dialog.getByRole('img',{name:'Rearmed weapon',exact:true}).count(),0);assert.ok((await dialog.getByRole('textbox',{name:'Refine icon URL for Luna Arc',exact:true}).inputValue()).includes('Luna_Arc_W.png'));const refineField=dialog.getByRole('textbox',{name:'Refine icon URL for Luna Arc',exact:true});const refineUrl=await refineField.inputValue();await refineField.fill('');assert.ok(await dialog.getByRole('button',{name:'Merge selected info'}).isDisabled());await refineField.fill(refineUrl);await dialog.getByRole('checkbox',{name:'Exclusive (PRF) for Lunar Flash II',exact:true}).check();await dialog.getByRole('checkbox',{name:'Exclusive (PRF) for Darting Blow 4',exact:true}).check();assert.equal(writes.length,0);assert.equal(await dialog.locator('.wiki-import-skills li').count(),await dialog.locator('.wiki-import-skill-icon').count());assert.ok(await dialog.locator('img.wiki-import-skill-icon').evaluateAll(images=>images.every(img=>img.referrerPolicy==='no-referrer')));assert.ok((await dialog.innerText()).includes('2019-04-27'));assert.ok((await dialog.innerText()).includes('Darting Blow 4'));assert.ok(!(await dialog.innerText()).includes('Darting Blow 1'));assert.ok((await dialog.innerText()).includes('Lunar Flash II'));
 await page.screenshot({path:'wiki-import-preview-check.png'});
 await page.setViewportSize({width:390,height:844});assert.ok(await dialog.evaluate(e=>e.scrollWidth<=e.clientWidth));await page.screenshot({path:'wiki-import-mobile-check.png'});
 changed=true;await dialog.getByRole('button',{name:'Merge selected info'}).click();await dialog.getByRole('alert').waitFor();assert.equal(writes.length,0);changed=false;
 await dialog.getByRole('button',{name:'Merge selected info'}).click();await dialog.getByRole('status').waitFor();await dialog.getByRole('alert').waitFor();assert.ok((await dialog.getByRole('alert').innerText()).includes('Darting Blow 4'));assert.equal(hero.release_date,'2019-04-27');assert.equal(skills.filter(s=>s.slot==='A').length,0);iconFailure=false;databaseFailure=true;await dialog.getByRole('button',{name:'Merge selected info'}).click();await dialog.getByRole('alert').waitFor();assert.equal(await dialog.getByRole('alert').innerText(),'Skill save denied for test.');databaseFailure=false;await dialog.getByRole('button',{name:'Merge selected info'}).click();await dialog.getByRole('alert').waitFor({state:'hidden'});await dialog.getByRole('status').waitFor();assert.equal(hero.debut_version,'3.4');assert.equal(hero.release_date,'2019-04-27');assert.equal(skills.filter(s=>s.name==='Luna Arc'&&!s.refined).length,1);assert.equal(skills.filter(s=>s.name==='Luna Arc'&&s.refined&&s.arcane).length,1);assert.equal(upload,10);assert.ok(skills.some(s=>s.name==='Darting Blow 4'&&s.icon_url));assert.ok(skills.some(s=>s.name==='Lunar Flash II'&&s.exclusive));assert.ok(skills.some(s=>s.name==='Darting Blow 4'&&s.exclusive));await page.route('**/rest/v1/rpc/is_tracker_owner',r=>r.fulfill({json:true}));
 await page.route('**/rest/v1/tracker_profiles?**',r=>r.fulfill({json:[{id:user.id,username:'wikistaff',display_name:'Wiki Staff'}]}));
 await page.route('**/feh-community-polls.shyguyvn.workers.dev/**',r=>r.fulfill({json:{polls:[],posts:[],user:null,connected:false,publicReady:false}}));
 hero.updated='2026-10-13T00:00:00Z';hero.schedule='None';hero.pool='L/M/E Pool';hero.notes='';hero.demote=false;
 await page.goto('http://127.0.0.1:5196/FEH-Rerun-Schedule-by-Clustifle/hero_profile/Alm_Saint-King_Rearmed');
 await page.getByRole('button',{name:'Import from FEH Wiki',exact:true}).click();
 await page.getByRole('dialog',{name:'Import from FEH Wiki'}).waitFor();await page.getByRole('button',{name:'Merge selected info',exact:true}).waitFor();await page.screenshot({path:'wiki-import-main-site-check.png'});
 assert.deepEqual(errors,[]);
 console.log('Actual wiki page fixture: preview identity/date/version/best tiers/icons, no writes before merge, preserved existing skills, stale preview rejection, partial icon failure/retry without losing release info, selected merge and mobile passed.');
}finally{await browser.close();}
