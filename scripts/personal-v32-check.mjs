import {themes} from '../pages-app/themes.ts';
import rules from '../lib/forum-rules.json' with {type:'json'};
import {chromium} from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';import assert from 'node:assert/strict';
const base=process.env.SITE_UI_URL||'http://127.0.0.1:5197/FEH-Rerun-Schedule-by-Clustifle/';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 let draftRecord={draft:null,revision:0,updatedAt:null};let forumRole='owner';const page=await browser.newPage({viewport:{width:1280,height:850},reducedMotion:'reduce'}),errors=[],writes=[];
 page.on('pageerror',e=>errors.push(e.message));
 const id='11111111-1111-4111-8111-111111111111',user={id,aud:'authenticated',role:'authenticated',identities:[{provider:'github',identity_data:{provider_id:'123',user_name:'member'}}]},token='eyJhbGciOiJIUzI1NiJ9.'+Buffer.from(JSON.stringify({sub:id,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.signature';
 await page.addInitScript(({user,token})=>{localStorage.setItem('sb-aknsqeqykjgdyhdroqcx-auth-token',JSON.stringify({access_token:token,refresh_token:'test-refresh',expires_at:Math.floor(Date.now()/1000)+3600,expires_in:3600,token_type:'bearer',user}));localStorage.setItem('feh-preferences',JSON.stringify({autoRefresh:false,theme:'fire-emblem-heroes'}));},{user,token});
 await page.route('**/auth/v1/user',r=>r.fulfill({json:user}));
 await page.route('**/rest/v1/**',r=>{const url=r.request().url();return r.fulfill({json:url.includes('tracker_role')?(forumRole==='moderator'?null:'Owner'):url.includes('is_tracker_owner')?true:url.includes('tracker_profiles')?[{id,username:'member',display_name:'Member'}]:[]});});

 const hero=(n,name,month,version)=>({id:'aaaaaaaa-aaaa-4aaa-8aaa-'+String(n).padStart(12,'0'),name,title:'Test hero '+n,category:'Legendary',color:'Red',portrait:null,pool:'General',schedule:'General',month,notes:'',debut_version:version});
 const heroes=[hero(1,'Marth','2020-01','1.0'),hero(2,'Ike','2027-01','3.0'),hero(3,'Lucina',null,'2.0')];
 let follows=[{hero_id:heroes[0].id,list_name:'Merge project'},{hero_id:heroes[1].id,list_name:'Saving for'},{hero_id:heroes[2].id,list_name:'Following'}];
 let tracking={followed_heroes:[heroes[0].id],saved_schedules:[{schedule:'General',month:'2027-01'}]};let failTracking=false;
 const profile={id,username:'member',display_name:'Member',bio:'Existing bio',about:'Existing about',favorite_heroes:[heroes[2].id],favorite_games:['Awakening'],social_links:[],visibility:{bio:false},avatar_path:null};
 await page.route('**/rest/v1/**',r=>{const u=new URL(r.request().url()),method=r.request().method();
 if(u.pathname.endsWith('/heroes'))return r.fulfill({json:heroes});
 if(u.pathname.includes('get_public_tracker_profile'))return r.fulfill({json:profile});
 if(u.pathname.endsWith('/tracker_watchlist')){if(method==='GET')return r.fulfill({json:follows});const body=r.request().postDataJSON();writes.push({table:'watchlist',method,body});if(method==='POST'){const found=follows.find(f=>f.hero_id===body.hero_id);if(found)found.list_name=body.list_name;else follows.push({hero_id:body.hero_id,list_name:body.list_name});}else follows=follows.filter(f=>'eq.'+f.hero_id!==u.searchParams.get('hero_id'));return r.fulfill({status:204});}
 if(u.pathname.endsWith('/tracker_personal_tracking')){if(failTracking)return r.fulfill({status:500,json:{message:'Unavailable'}});if(method==='GET')return r.fulfill({json:tracking});tracking={...tracking,...r.request().postDataJSON()};writes.push({table:'tracking',body:tracking});return r.fulfill({json:[tracking]});}
 return r.fulfill({json:u.pathname.includes('tracker_role')?'Owner':u.pathname.includes('is_tracker_owner')?true:u.pathname.includes('tracker_profiles')?[profile]:[]});});
 await page.goto(base+'watchlist');await page.getByRole('button',{name:'Merge project',exact:false}).waitFor();
 await page.waitForFunction(()=>document.querySelectorAll('.hub-stats strong')[1]?.textContent==='1');assert.equal(await page.locator('.hub-stats strong').nth(1).innerText(),'1','Only future/current reruns count');
 assert.equal(writes.length,0,'Loading never rewrites saved records');
 await page.getByLabel('Sort heroes').selectOption('release');await page.getByRole('button',{name:'list view',exact:true}).click();
 assert.ok((await page.locator('.hub-hero').first().innerText()).includes('Ike'));
 await page.reload();await page.getByLabel('Sort heroes').waitFor();await page.waitForFunction(()=>document.querySelector('.hub-view-list'));
 assert.equal(await page.getByLabel('Sort heroes').inputValue(),'release');
 assert.equal(follows[0].list_name,'Merge project');assert.equal(writes.length,0);
 await page.getByLabel('Collection for Marth').selectOption('Waiting for rerun');await page.getByText('Watchlist saved.',{exact:true}).waitFor();
 assert.equal(follows.find(f=>f.hero_id===heroes[0].id).list_name,'Waiting for rerun');assert.equal(follows.find(f=>f.hero_id===heroes[1].id).list_name,'Saving for');
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:'watchlist-v32-mobile.png',fullPage:true});await page.setViewportSize({width:1280,height:850});await page.screenshot({path:'watchlist-v32-desktop.png',fullPage:true});
 await page.goto(base+'profile/member');await page.getByRole('heading',{name:'Welcome back, Member.',exact:true}).waitFor();await page.getByRole('heading',{name:'Saved schedules',exact:true}).waitFor();
 await page.locator('.profile-earlier-follows summary').click();assert.ok((await page.locator('.profile-private').innerText()).includes('Marth'));assert.ok((await page.locator('.profile-saved-list').innerText()).includes('Jan 2027'));
 const before=JSON.stringify(tracking);await page.locator('.profile-save-schedule select').selectOption('DSH Waitlist');assert.equal(await page.locator('.profile-save-schedule input[type=month]').count(),0);await page.getByRole('button',{name:'Save schedule',exact:true}).click();await page.getByText('Schedule saved.',{exact:true}).waitFor();assert.deepEqual(tracking.followed_heroes,[heroes[0].id]);assert.deepEqual(tracking.saved_schedules[0],JSON.parse(before).saved_schedules[0]);assert.deepEqual(tracking.saved_schedules[1],{schedule:'DSH Waitlist',month:''});
 const identity=await page.locator('.public-profile-card').boundingBox(),details=await page.locator('.public-profile-details').boundingBox();assert.ok(details.x>identity.x+identity.width,'Desktop identity and details sit side by side');const watch=await page.locator('.profile-watchlist-card').boundingBox(),saved=await page.locator('.profile-private').boundingBox();assert.ok(saved.x>watch.x,'Watchlist and schedules sit side by side');await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'profile-v32-desktop.png',fullPage:true});await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:'profile-v32-mobile.png',fullPage:true});
 failTracking=true;await page.reload();await page.getByText('Your saved tracking could not be read.',{exact:false}).waitFor();assert.equal(await page.getByRole('button',{name:'Save schedule',exact:true}).count(),0,'Read failure cannot replace saved data with empty arrays');
 assert.deepEqual(errors,[]);console.log('Personal v3.2 passed: collection preservation, read-only load, persisted sort/view, past rerun handling, schedule/follow preservation, failed-read write prevention, responsive profile/watchlist.');
}finally{await browser.close();}
