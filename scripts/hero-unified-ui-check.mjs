import {chromium} from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const source=JSON.parse(await readFile('public/data/heroes.json','utf8')).find(h=>h.name==='Lucina');
const hero={...source,pool:'L/M/E Pool',schedule:'General',month:'2026-10-01',weapon_type:'Sword',move_type:'Infantry',debut_version:'10.9',release_date:'2026-09-18',notes:'Next appearance is listed in the General Schedule.',updated:'2026-10-13T00:00:00Z',revision:1};
let role='Owner',category=hero.category;
const names=['Awakening Falchion','Reposition','Lodestar Rush','Swift Specter','Spd/Def Tempo 4','Infantry Pulse 4'];
const rows=['Weapon','Assist','Special','A','B','C'].map((slot,i)=>({id:'skill-'+i,hero_id:hero.id,slot,name:names[i],family:names[i],tier:i>2?4:null,description:'',refined:false,arcane:false,exclusive:false,icon_url:i>2?'http://127.0.0.1:5196/FEH-Rerun-Schedule-by-Clustifle/skill-slots/passive-empty.png':null,revision:1}));
rows.push({...rows[3],id:'lower-tier',tier:3,name:'Swift Specter 3'});
rows.push({...rows[3],id:'x-test',slot:'X',name:'Test Echo',family:'Test Echo'});
const user={id:'11111111-1111-4111-8111-111111111111',aud:'authenticated',role:'authenticated'},token='eyJhbGciOiJIUzI1NiJ9.'+Buffer.from(JSON.stringify({sub:user.id,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.signature';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage({viewport:{width:1366,height:768}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(({user,token})=>localStorage.setItem('sb-aknsqeqykjgdyhdroqcx-auth-token',JSON.stringify({access_token:token,refresh_token:'test',expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user})),{user,token});
 await page.route('**/auth/v1/user',r=>r.fulfill({json:user}));
 await page.route('**/rest/v1/**',r=>{
  const path=new URL(r.request().url()).pathname;let data=[];
  if(path.endsWith('tracker_role'))data=role;
  else if(path.endsWith('is_tracker_owner'))data=['Owner','Manager'].includes(role);
  else if(path.endsWith('tracker_profiles'))data=[{id:user.id,username:'staff',display_name:'Staff'}];
  else if(path.endsWith('tracker_hero_skills'))data=rows;
  else if(path.endsWith('heroes'))data=r.request().headers().accept?.includes('object')?{...hero,category}:[{...hero,category}];
  else if(path.endsWith('tracker_banners'))data=[{id:'banner',name:'Recorded September banner',starts_on:'2026-09-18',ends_on:'2026-10-01',tracker_banner_heroes:[{hero_id:hero.id,slot_index:0}]}];
  return r.fulfill({json:data});
 });
 await page.route('**/feh-community-polls.shyguyvn.workers.dev/**',r=>r.fulfill({json:{polls:[],posts:[],user:null,connected:false,publicReady:false}}));
 const base='http://127.0.0.1:5196/FEH-Rerun-Schedule-by-Clustifle/';
 const visit=async()=>{await page.goto(base+'hero_profile/Lucina_Of_Awakening_'+category);await page.getByRole('heading',{name:'Swift Specter',exact:true}).waitFor();await page.getByRole('button',{name:'Add to my watchlist',exact:true}).waitFor();};
 await visit();
 const announcement=page.locator('.newsflash button');if(await announcement.count())await announcement.first().click();
 assert.equal(await page.getByRole('tab').count(),0);
 assert.equal(await page.getByRole('heading',{name:'Overview',exact:true}).count(),1);
 assert.equal(await page.getByRole('heading',{name:'Skills',exact:true}).count(),1);
 assert.equal(await page.getByRole('heading',{name:'Swift Specter 3',exact:true}).count(),0);
 assert.equal(await page.locator('.hero-skill-slot[aria-label="X skill slot"]').count(),0);
 assert.equal(await page.locator('.hero-detail-identity').getByText('Of Awakening',{exact:true}).count(),1);
 assert.ok(await page.locator('.hero-detail-tags').innerText());
 assert.equal(await page.getByRole('heading',{name:'Recorded banner appearances',exact:true}).count(),0);
 assert.equal(await page.locator('#hero-overview-heading svg,#hero-skills-heading svg').count(),0);
 for(const width of [1366,900,390,320]){
  await page.setViewportSize({width,height:width>700?768:844});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.ok(await page.locator('.hero-detail-layout').evaluate(e=>e.scrollWidth<=e.clientWidth+1));
  const layout=await page.locator('.hero-profile-summary-grid').evaluate(e=>{const [a,b]=[...e.children].map(x=>x.getBoundingClientRect());return {sameTop:Math.abs(a.top-b.top)<2,separate:b.left>=a.right,stacked:b.top>=a.bottom};});
  if(width>1000)assert.ok(layout.sameTop&&layout.separate);else assert.ok(layout.stacked);
  if(width<=700){await page.locator('.hero-detail-layout').evaluate(e=>e.scrollTop=e.scrollHeight);assert.ok(await page.locator('.hero-detail-bottom').evaluate(e=>{const r=e.getBoundingClientRect();return r.bottom<=innerHeight+1&&r.top>=0;}));await page.locator('.hero-detail-layout').evaluate(e=>e.scrollTop=0);}
  if(width===1366||width===390)await page.screenshot({path:'hero-unified-'+width+'.png'});
 }
 const themes=await readFile('pages-app/themes.ts','utf8');
 for(const match of themes.matchAll(/realm:'([^']+)'[^\n]+header:'([^']+)',deep:'([^']+)',panel:'([^']+)',field:'([^']+)',accent:'([^']+)',line:'([^']+)'/g)){
  await page.evaluate(([realm,header,deep,panel,field,accent,line])=>{const root=document.documentElement;root.dataset.realm=realm;for(const [k,v] of Object.entries({header,deep,panel,field,accent,line}))root.style.setProperty('--realm-'+k,v);},match.slice(1));
  assert.ok(await page.locator('.hero-profile-overview').evaluate(e=>{const probe=document.createElement('span');probe.style.backgroundColor='var(--realm-panel)';e.append(probe);const expected=getComputedStyle(probe).backgroundColor;probe.remove();return getComputedStyle(e).backgroundColor===expected&&getComputedStyle(e).fontFamily.includes('FEHeroes');}));
 }
 await page.setViewportSize({width:1366,height:768});
 await page.getByRole('button',{name:'Edit Skills on this unit',exact:true}).click();
 await page.getByRole('dialog',{name:'Edit Skills · Lucina'}).waitFor();
 await page.getByRole('button',{name:'Close unit skills editor',exact:true}).click();
 for(const visitorRole of ['Visitor','Moderator']){role=visitorRole;category='General';await visit();assert.equal(await page.getByRole('button',{name:'Edit Skills on this unit',exact:true}).count(),0);assert.equal(await page.getByRole('button',{name:'Edit hero',exact:true}).count(),0);assert.equal(await page.locator('.hero-skill-slot').count(),6);}
 category='Attuned';await visit();assert.equal(await page.locator('.hero-skill-slot[aria-label="X skill slot"]').count(),1);
 assert.deepEqual(errors,[]);
 console.log('Unified profile: side-by-side desktop, tablet/mobile scrolling, portrait identity, 11 theme palettes, highest tiers, Attuned X and staff edit permissions passed.');
}finally{await browser.close();}
