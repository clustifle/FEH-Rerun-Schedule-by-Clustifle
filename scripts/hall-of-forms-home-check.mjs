import {chromium} from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {releasedFeaturedHeroes} from '../pages-app/rerun-waitlist.ts';
assert.equal(releasedFeaturedHeroes([{event_type:'hof',banner_type:'featured',name:'Hall of Forms',starts_on:'2020-01-01',tracker_banner_heroes:[{hero_id:'hof-only'}]}]).size,0);
assert.equal(releasedFeaturedHeroes([{banner_type:'featured',name:'New Heroes',starts_on:'2020-01-01',tracker_banner_heroes:[{hero_id:'summon'}]}]).size,1);
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const heroes=['Alfonse','Sharena','Anna','Fjorm'].map((name,i)=>({id:String(i),name,title:'Test Hero',category:'General',color:'Red',portrait:'data/portraits/edfbaac5-3079-488c-b12e-c7b1333a5ee4.webp',schedule:'None',month:null,move_type:'Infantry',weapon_type:'Sword'}));
 const skill={id:'skill-1',slot:'A',name:'Test monthly skill',refined:false,icon_url:null},user={id:'11111111-1111-4111-8111-111111111111',aud:'authenticated',role:'authenticated'},token='eyJhbGciOiJIUzI1NiJ9.'+Buffer.from(JSON.stringify({sub:user.id,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.signature';
 let banner={id:'hof-event',name:'Hall of Forms: Test',event_type:'hof',banner_type:'featured',starts_on:'2090-01-01',ends_on:'2090-01-20',starts_time:'07:00',ends_time:'06:59',coming_soon:true,skills_month:'2090-01-01',added_skills:[skill],slot_count:4,tracker_banner_heroes:heroes.map((h,i)=>({hero_id:h.id,slot_index:i}))},saved;
 await p.addInitScript(({user,token})=>{localStorage.setItem('sb-aknsqeqykjgdyhdroqcx-auth-token',JSON.stringify({access_token:token,refresh_token:'test',expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user}));localStorage.setItem('feh-preferences',JSON.stringify({autoRefresh:false,carouselAutoplay:false}));},{user,token});
 await p.route('**/auth/v1/user',r=>r.fulfill({json:user}));
 await p.route('**/rest/v1/**',r=>{const path=new URL(r.request().url()).pathname;let data=[];if(path.endsWith('is_tracker_owner'))data=true;else if(path.endsWith('/tracker_profiles'))data={username:'test_manager',display_name:'Test Manager'};else if(path.endsWith('tracker_role'))data='Manager';else if(path.endsWith('/heroes'))data=heroes;else if(path.endsWith('/tracker_banners'))data=[banner];else if(path.endsWith('/tracker_hero_skills'))data=[skill];else if(path.endsWith('save_tracker_banner_event')){saved=r.request().postDataJSON();banner={...banner,added_skills:saved.event_skills,skills_month:saved.event_month};data=banner.id;}return r.fulfill({json:data});});
 await p.goto('http://127.0.0.1:5196/FEH-Rerun-Schedule-by-Clustifle/');
 await p.getByRole('heading',{name:'Current banner & event',exact:true}).waitFor();
 await p.locator('.featured-banner-hero').nth(3).waitFor();assert.equal(await p.locator('.featured-banner-hero').count(),4);
 for(const width of [320,390,768,1280]){await p.setViewportSize({width,height:900});await p.getByRole('button',{name:'View skills added this month'}).click();await p.getByRole('heading',{name:'Skills added this month'}).waitFor();assert.ok(await p.locator('.hof-added-skills').innerText().then(t=>t.includes(skill.name)));assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));if(width===390)await p.screenshot({path:'hall-of-forms-skills-mobile.png'});await p.keyboard.press('Escape');assert.equal(await p.locator('.hof-skills-dialog').count(),0);}
 await p.locator('.banner-card-menu summary').click();
 await p.getByRole('button',{name:/Edit banner/i}).click();
 const editor=p.locator('dialog.banner-editor');await editor.waitFor();assert.equal(await editor.locator('select').first().inputValue(),'hof');assert.equal(await editor.locator('.banner-editor-slot.is-filled').count(),4);
 await editor.getByLabel('Skill update month').fill('2090-02');await editor.getByRole('button',{name:'Save banner',exact:true}).click();
 await editor.waitFor({state:'hidden'});assert.equal(saved.event_kind,'hof');assert.equal(saved.layout_type,'featured');assert.equal(saved.event_month,'2090-02-01');assert.equal(saved.hero_ids.length,4);assert.equal(saved.event_skills[0].name,skill.name);
 assert.deepEqual(errors,[]);console.log('Hall of Forms: upcoming four-hero card, monthly skills, Escape, mobile layouts, and staff save passed.');
}finally{await browser.close();}
