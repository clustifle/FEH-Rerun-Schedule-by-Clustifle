import {chromium} from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const base=process.env.SITE_UI_URL||'http://127.0.0.1:5192/';
const id='11111111-1111-4111-8111-111111111111',user={id,aud:'authenticated',role:'authenticated',email:'test@example.com',identities:[{provider:'github'}]},payload=Buffer.from(JSON.stringify({sub:id,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url'),token='eyJhbGciOiJIUzI1NiJ9.'+payload+'.signature';
const heroes=Array.from({length:30},(_,i)=>({id:i?`22222222-2222-4222-8222-${String(i).padStart(12,'0')}`:id,name:i?'Hero '+i:'Ike',title:'Vanguard Legend',category:'Legendary',pool:'L/M/E Pool',color:['Red','Blue','Green','Colorless'][i%4],weapon_type:'Sword',move_type:'Infantry',schedule:i%3?'General':'Remix',month:'2026-12',notes:'Keep',blessing:'Earth',portrait:null,revision:1,updated:'2026-10-09',demote:false,heroic_grail:false}));
try{const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(({user,token})=>{localStorage.setItem('sb-aknsqeqykjgdyhdroqcx-auth-token',JSON.stringify({access_token:token,refresh_token:'test-refresh',expires_at:Math.floor(Date.now()/1000)+3600,expires_in:3600,token_type:'bearer',user}));localStorage.setItem('feh-preferences',JSON.stringify({autoRefresh:false,theme:'fire-emblem-heroes'}));},{user,token});
await page.route('**/auth/v1/user',r=>r.fulfill({json:user}));
await page.route('**/rest/v1/**',r=>{const url=r.request().url();return r.fulfill({json:url.includes('tracker_role')?'Owner':url.includes('tracker_profiles')?[{id,username:'test_admin',display_name:'Test Admin'}]:[]});});
await page.route('**/_beta/session',r=>r.fulfill({json:{ok:true}}));
await page.route('**/_beta/api/**',r=>r.fulfill({json:r.request().url().endsWith('/heroes')?heroes:r.request().url().endsWith('/versions')?[{version:'10.0',sort_order:1000}]:r.request().url().endsWith('/waitlists')?[{hero_id:id,list_kind:'lme',sort_order:1}]:[]}));
if(!process.env.THEME_ONLY)for(const width of [320,360,390,768]){await page.setViewportSize({width,height:740});for(const route of ['home','all-heroes','faq','settings/appearance','settings/account','schedule/general','schedule/remix','schedule/new-heroes-revival','schedule/hall-of-forms-revival','rerun-waitlist/lme','watchlist','community']){
await page.goto(base+route);await page.locator('.tracker').waitFor();await page.waitForTimeout(150);
const overflow=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,items:[...document.querySelectorAll('body *')].filter(el=>{const b=el.getBoundingClientRect();return b.width&&b.right>innerWidth+2&&getComputedStyle(el).position!=='fixed'&&!el.closest('.month-scroll,.directory-table,.month-carousel');}).slice(0,8).map(el=>el.className)}));
assert.ok(overflow.scroll<=width+1,`${route} at ${width}px: ${JSON.stringify(overflow)}`);
for(const dialog of await page.locator('dialog[open]').all())assert.ok(await dialog.evaluate(el=>el.getBoundingClientRect().right<=innerWidth+1),`${route} dialog at ${width}px`);
}console.log(`Site routes fit at ${width}px.`);}
for(const width of [320,1280]){await page.setViewportSize({width,height:800});await page.goto(base+'settings/appearance');await page.locator('.theme-options').waitFor();await page.getByRole('button',{name:'Reset settings',exact:true}).click();
for(const theme of ['fire-emblem-heroes','midgard','nifl','muspell','hel','ljosalfheimr','dokkalfheimr','nidavellir','jotunheimr','vanaheimr','asgardr']){
await page.locator(`.theme-options input[value="${theme}"]`).evaluate(el=>el.click());
assert.equal(await page.locator('html').getAttribute('data-realm'),theme==='fire-emblem-heroes'?'base':theme);
const button=page.getByRole('button',{name:'Restore defaults',exact:true});assert.equal(await button.evaluate(el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)');assert.ok(await button.evaluate(el=>getComputedStyle(el,'::before').backgroundImage.includes('Common_Button')));await button.hover();assert.equal(await button.evaluate(el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
}console.log(`All 11 themes: transparent sprite buttons, hover, settings and width passed at ${width}px.`);}
assert.deepEqual(errors,[]);console.log('Full site: mobile route layouts, settings dialogs and runtime errors passed.');
}finally{await browser.close();}
