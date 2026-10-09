import {chromium} from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const base=process.env.SITE_UI_URL||'http://127.0.0.1:5193/FEH-Rerun-Schedule-by-Clustifle/';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{for(const role of ['Owner','Manager']){
 const page=await browser.newPage({viewport:{width:1280,height:850}}),errors=[],writes=[],betaCalls=[];
 page.on('pageerror',e=>errors.push(e.message));
 const id='11111111-1111-4111-8111-111111111111',user={id,aud:'authenticated',role:'authenticated',identities:[{provider:'github'}]},token='eyJhbGciOiJIUzI1NiJ9.'+Buffer.from(JSON.stringify({sub:id,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.signature';
 const hero={id,name:'Ike',title:'Test Hero',category:'General',pool:'General Pool',color:'Red',weapon_type:'Sword',move_type:'Infantry',schedule:'None',month:null,notes:'Keep',blessing:null,portrait:null,revision:1,updated:'2026-10-09',demote:false,heroic_grail:false};
 let versions=[{version:'10.0',sort_order:1000,release_date:null}],watch=[];
 await page.addInitScript(({user,token})=>{localStorage.setItem('sb-aknsqeqykjgdyhdroqcx-auth-token',JSON.stringify({access_token:token,refresh_token:'test-refresh',expires_at:Math.floor(Date.now()/1000)+3600,expires_in:3600,token_type:'bearer',user}));localStorage.setItem('feh-preferences',JSON.stringify({autoRefresh:false,theme:'fire-emblem-heroes'}));},{user,token});
 await page.route('**/auth/v1/user',r=>r.fulfill({json:user}));
 await page.route('**/_beta/**',r=>{betaCalls.push(r.request().url());return r.fulfill({status:500,json:{error:'Beta must not be called'}});});
 await page.route('**/rest/v1/**',r=>{
  const url=r.request().url(),method=r.request().method();let response=[];
  if(url.includes('tracker_role'))response=role;
  else if(url.includes('is_tracker_owner'))response=true;
  else if(method!=='GET'&&method!=='HEAD'){const body=r.request().postDataJSON();writes.push({url,body});
   if(url.includes('tracker_v2_save_heroes')){Object.assign(hero,body.records[0]);response={count:body.records.length,id};}
   if(url.includes('tracker_v2_versions')){versions.push(body.payload);response={ok:true};}
   if(url.includes('tracker_watchlist'))watch=method==='DELETE'?[]:[body];
  }else if(url.includes('tracker_role'))response=role;
  else if(url.includes('is_tracker_owner'))response=true;
  else if(url.includes('/heroes?'))response=url.includes('id=eq.')?hero:[hero];
  else if(url.includes('tracker_feh_versions'))response=versions;
  else if(url.includes('tracker_watchlist'))response=watch;
  else if(url.includes('tracker_profiles'))response=[{id,username:'test_admin',display_name:'Test Admin'}];
  return r.fulfill({json:response});
 });
 await page.goto(base+'FEHRS_AdmManager/mods-edit/');
 const nav=page.getByRole('navigation',{name:'Administrative sections'});await nav.waitFor();
 assert.equal(await nav.getByRole('button',{name:'Staff & Users',exact:true}).count(),role==='Owner'?1:0);
 await page.getByRole('tab',{name:'Manage FEH Versions'}).click();await page.getByRole('button',{name:'Edit v10.0'}).waitFor();
 await page.getByRole('button',{name:'Add version',exact:true}).click();await page.getByLabel('Version number',{exact:true}).fill('10.1');await page.locator('.version-editor-panel').getByRole('button',{name:'Add version',exact:true}).click();await page.getByText('Version saved. Hero forms and filters are updated.',{exact:true}).waitFor();
 assert.equal(writes.at(-1).body.payload.version,'10.1');
 await nav.getByRole('button',{name:'Heroes',exact:true}).click();await page.getByRole('button',{name:'Edit Ike',exact:true}).click();await page.getByLabel('Hero name',{exact:true}).fill('Ike updated');await page.getByRole('button',{name:'Save hero',exact:true}).click();await page.getByText('Hero record saved.',{exact:true}).waitFor();
 assert.equal(writes.at(-1).body.records[0].name,'Ike updated');assert.equal(writes.at(-1).body.records[0].revision,1);
 await page.setViewportSize({width:320,height:568});await page.getByRole('button',{name:'Toggle navigation'}).click();await nav.getByRole('button',{name:'Mods Edit',exact:true}).click();await page.getByRole('tab',{name:'Bulk Edit Heroes'}).click();await page.locator('.bulk-editor').waitFor();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.locator('.bulk-roster-list input[type=checkbox]').first().check();await page.locator('.bulk-field').filter({has:page.getByText('Notes',{exact:true})}).getByRole('checkbox').check();await page.getByLabel('Update Notes',{exact:true}).fill('Public bulk test');await page.getByRole('button',{name:'Review changes',exact:true}).click();await page.getByRole('button',{name:'Save changes',exact:true}).click();await page.getByText('1 heroes updated.',{exact:true}).waitFor();assert.equal(writes.at(-1).body.records[0].notes,'Public bulk test');
 await page.goto(base+'hero_profile/Ike_updated_Test_Hero_General');await page.getByRole('button',{name:'Add to my watchlist',exact:true}).click();await page.getByRole('button',{name:'Remove from my watchlist',exact:true}).waitFor();assert.equal(writes.at(-1).body.hero_id,id);
 await page.getByRole('link',{name:'My Watchlist',exact:true}).click();await page.getByRole('heading',{name:'My Watchlist',exact:true,level:2}).waitFor();await page.getByText('1 saved heroes',{exact:true}).waitFor();assert.ok(page.url().startsWith(base));
 await page.goto(base+'community');await page.getByRole('heading',{name:'Community Posts',exact:true}).waitFor();
 assert.deepEqual(betaCalls,[]);assert.deepEqual(errors,[]);await page.close();console.log(role+': public versions, hero saves, private watchlist, mobile manager, Community posts and no beta API calls passed.');
}}finally{await browser.close();}
