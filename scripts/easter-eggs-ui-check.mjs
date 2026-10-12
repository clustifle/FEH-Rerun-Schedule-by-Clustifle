import {chromium} from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{localStorage.setItem('feh-preferences',JSON.stringify({autoRefresh:false}));const OriginalAudio=window.Audio;window.__eggAudios=[];window.Audio=function(...args){const sound=new OriginalAudio(...args);window.__eggAudios.push(sound);return sound;};});
 const hero={id:'00000000-0000-4000-8000-000000000001',name:'Test Hero',title:'Test Title',category:'General',color:'Red',portrait:null,schedule:'General',pool:'General Pool',month:'2026-10',notes:'',demote:false,revision:1};
 await page.route('**/rest/v1/**',r=>{const url=r.request().url();return r.fulfill({json:url.includes('tracker_role')?null:url.includes('/heroes')?[hero]:url.includes('waitlist')?[{hero_id:hero.id}]:[]});});
 await page.route('**/feh-community-polls.shyguyvn.workers.dev/**',r=>r.fulfill({json:{polls:[],posts:[],user:null,connected:false,publicReady:false}}));
 const base='http://127.0.0.1:5196/FEH-Rerun-Schedule-by-Clustifle/';
 await page.goto(base+'home');const owl=page.getByRole('button',{name:'Interact with Feh',exact:true});await owl.waitFor();assert.equal(await page.locator('.masthead [data-egg-mount="feh"]').count(),1);
 for(const mood of ['happy','sleepy','awake']){await owl.click();await page.waitForFunction(mood=>document.querySelector('.egg-object-feh img').src.endsWith('feh-'+mood+'.png'),mood);}
 for(const width of [320,390,1280]){await page.setViewportSize({width,height:750});console.log(width,await owl.evaluate(e=>{const r=e.getBoundingClientRect(),logo=document.querySelector('.feh-wordmark img').getBoundingClientRect(),menu=document.querySelector('[aria-controls="mobile-navigation"]').getBoundingClientRect();return {owl:[r.left,r.right,r.top,r.bottom],logo:logo.right,menu:menu.left};}));assert.ok(await owl.evaluate(e=>{const r=e.getBoundingClientRect(),logo=document.querySelector('.feh-wordmark img').getBoundingClientRect(),menu=document.querySelector('[aria-controls="mobile-navigation"]').getBoundingClientRect();return r.left>=logo.right&&r.right<=menu.left&&r.top>=0&&r.bottom<=innerHeight;}));}await page.screenshot({path:'feh-header-check.png'});
 const cases=[['home','seasonal'],['settings/about','pixel'],['skills','maxwell'],['schedule/weekly-revivals','pedro'],['rerun-waitlist/lme','fine'],['schedule/general','anna'],['faq','quotes']];
 async function discover(id){
  if(id==='maxwell')await page.locator('.skills-directory input[type="search"]').fill('Maxwell');
  else if(id==='pedro')await page.locator('.weekly-revivals h3').first().dblclick();
  else if(id==='anna'){await page.getByRole('button',{name:'Share or export schedule',exact:true}).click();await page.getByRole('button',{name:'Close schedule export',exact:true}).click();}
  else{await page.locator(`[data-egg-mount="${id}"]`).evaluate(e=>e.parentElement.scrollIntoView({block:'end'}));await page.mouse.wheel(0,600);}
  await page.locator(`[data-egg-mount="${id}"] .egg-direct.is-active`).waitFor();
 }
 for(const [route,id] of cases){
  console.log('Checking hidden action',id);await page.goto(base+route);await page.locator(`[data-egg-mount="${id}"]`).waitFor({state:'attached'});
  assert.equal(await page.locator('[data-egg-mount]:not([data-egg-mount="feh"]) button').count(),0);
  assert.equal(await page.locator('[data-egg-mount="greeting"]').count(),0);
  await discover(id);assert.equal(await page.locator('.egg-dialog,.egg-collection').count(),0);assert.equal(await page.getByRole('button',{name:'Replay',exact:true}).count(),0);
  await page.keyboard.press('Escape');await page.locator(`[data-egg-mount="${id}"] .egg-direct.is-active`).waitFor({state:'hidden'});
  // Re-enter the route to verify the hidden action remains reusable.
  await page.goto(base+'users');await page.goto(base+route);await discover(id);
 }
 await page.goto(base+'home');await discover('seasonal');await page.locator('.egg-visual-seasonal').scrollIntoViewIfNeeded();await page.screenshot({path:'halloween-visual-check.png'});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.keyboard.press('Escape');await page.evaluate(()=>window.scrollTo(0,0));await page.mouse.wheel(0,-600);await page.waitForTimeout(150);await discover('seasonal');

 await page.goto(base+'users');const input=page.getByRole('searchbox',{name:'Search users',exact:true});await input.fill('Ferrari');await input.press('Enter');await page.locator('.user-search-count').waitFor();assert.equal(await page.locator('.ferran-scene').count(),0);
 for(const term of ['Ferran',' ferran ','@FERRAN']){await input.fill(term);await input.press('Enter');await page.locator('.ferran-scene').waitFor();await page.waitForFunction(()=>window.__eggAudios.some(a=>!a.paused));assert.equal(await page.locator('.ferran-scene button,.egg-dialog').count(),0);await page.keyboard.press('Escape');await page.locator('.ferran-scene').waitFor({state:'hidden'});assert.ok(await page.evaluate(()=>window.__eggAudios.every(a=>a.paused)));}
 await page.setViewportSize({width:390,height:700});await input.fill('Ferran');await input.press('Enter');await page.locator('.ferran-scene').waitFor();await page.screenshot({path:'ferran-scene-mobile-check.png'});await page.locator('.ferran-scene').click();await page.locator('.ferran-scene').waitFor({state:'hidden'});
 await input.press('Enter');await page.locator('.ferran-scene').waitFor();await page.locator('.ferran-scene').waitFor({state:'hidden',timeout:10000});assert.ok(await page.evaluate(()=>window.__eggAudios.every(a=>a.paused)));
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'skills');await discover('maxwell');assert.ok((await page.locator('[data-egg-mount="maxwell"] .egg-discovered-art').getAttribute('src')).endsWith('maxwell-still.webp'));await page.locator('[data-egg-mount="maxwell"] .egg-direct.is-active').waitFor({state:'hidden',timeout:8000});
 assert.deepEqual(errors,[]);console.log('Hidden actions: no secret icon buttons or shield, scroll/search/heading/export triggers, repeat visits, header owl, Ferran audio/dismiss, mobile and reduced motion passed.');
}finally{await browser.close();}
