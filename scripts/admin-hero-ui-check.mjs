import {chromium} from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[],writes=[];
 page.on('pageerror',e=>errors.push(e.message));
 const id='11111111-1111-4111-8111-111111111111',user={id,aud:'authenticated',role:'authenticated'},token='eyJhbGciOiJIUzI1NiJ9.'+Buffer.from(JSON.stringify({sub:id,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.signature';
 await page.addInitScript(({user,token})=>localStorage.setItem('sb-aknsqeqykjgdyhdroqcx-auth-token',JSON.stringify({access_token:token,refresh_token:'test',expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user})),{user,token});
 await page.route('**/auth/v1/user',r=>r.fulfill({json:user}));
 await page.route('**/rest/v1/**',r=>{const url=r.request().url();let data=[];if(url.includes('tracker_role'))data='Owner';if(url.includes('tracker_v2_save_heroes')){writes.push(r.request().postDataJSON());data={ok:true};}return r.fulfill({json:data});});
 await page.goto('http://127.0.0.1:5193/FEH-Rerun-Schedule-by-Clustifle/FEHRS_AdmManager/heroes/add/');
 await page.getByLabel('Hero name',{exact:true}).waitFor();assert.equal(await page.locator('dialog[open]').count(),0);
 assert.ok((await page.locator('.adm-hero-page').evaluate(e=>getComputedStyle(e).fontFamily)).includes('Segoe UI'));
 for(const text of ['Identity','Combat details','Schedule & release','Additional details'])await page.getByRole('heading',{name:text,exact:true}).waitFor();
 await page.getByLabel('Hero name',{exact:true}).fill('Test Hero');await page.getByLabel('Hero type',{exact:true}).selectOption('Legendary');await page.getByRole('button',{name:'Save hero',exact:true}).click();assert.equal(writes.length,0);await page.getByLabel('Blessing · required',{exact:true}).selectOption('Fire');
 for(const width of [320,390,768,1280]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Overflow at '+width);}
 await page.getByRole('button',{name:'Save hero',exact:true}).click();await page.waitForURL('**/heroes');assert.equal(writes.length,1);assert.equal(writes[0].records[0].blessing,'Fire');assert.equal(writes[0].records[0].name,'Test Hero');
 await page.goBack();await page.getByLabel('Hero name',{exact:true}).waitFor();assert.equal(await page.locator('dialog[open]').count(),0);await page.getByRole('button',{name:'Cancel',exact:true}).click();await page.waitForURL('**/heroes');assert.equal(writes.length,1);assert.deepEqual(errors,[]);
 console.log('Administrative Add Hero: dedicated route, Segoe UI, sections, required blessing, saved payload, cancellation, back navigation, and four responsive widths passed.');
}finally{await browser.close();}
