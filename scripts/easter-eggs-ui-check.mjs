import {chromium} from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/rest/v1/**',r=>r.fulfill({json:r.request().url().includes('tracker_role')?null:[]}));
 await page.route('**/feh-community-polls.shyguyvn.workers.dev/**',r=>r.fulfill({json:{polls:[],posts:[],user:null,connected:false,publicReady:false}}));
 await page.goto('http://127.0.0.1:5196/FEH-Rerun-Schedule-by-Clustifle/home');
 const open=page.getByRole('button',{name:'Open Anna’s Secret Stash',exact:true});await open.click();
 const dialog=page.getByRole('dialog',{name:'Anna’s Secret Stash',exact:true});await dialog.waitFor();
 assert.equal(await dialog.locator('.egg-discovery').count(),12);
 for(const clue of ['site logo','word pixel','colourless','striker','spinning cat','pedro','perfectly fine','merchant','↑','secret quote','visiting messenger']){
  await page.locator('.egg-discovery').filter({hasText:clue}).click();
  await page.locator('.egg-art').waitFor();await page.waitForFunction(()=>{const i=document.querySelector('.egg-art');return i?.complete&&i.naturalWidth>0;});
  if(clue==='striker'){await page.getByRole('button',{name:'Play Ferran audio',exact:true}).click();await page.getByRole('button',{name:'Stop sound',exact:true}).waitFor();}
  await page.getByRole('button',{name:'Back to discoveries',exact:true}).click();
 }
 await page.locator('.egg-discovery').filter({hasText:'cursed orb'}).click();await page.getByRole('button',{name:'Enable spooky surprises & open orb',exact:true}).waitFor();
 assert.equal(await page.locator('.egg-art').count(),0);await page.getByRole('button',{name:'Enable spooky surprises & open orb',exact:true}).click();await page.locator('.egg-fomortiis .egg-art').waitFor();
 await page.keyboard.press('Escape');assert.equal(await page.locator('dialog.egg-dialog[open]').count(),0);
 await page.reload();await open.click();await page.getByText('12 / 12 discoveries · Saved on this device',{exact:true}).waitFor();await page.keyboard.press('Escape');
 await page.keyboard.type('pedro');await page.locator('.egg-pedro .egg-art').waitFor();await page.keyboard.press('Escape');
 await page.waitForTimeout(1600);await page.locator('.feh-wordmark').click({clickCount:5});await page.locator('.egg-feh .egg-art').waitFor();await page.keyboard.press('Escape');
 await page.setViewportSize({width:390,height:700});await open.click();await page.locator('dialog.egg-dialog[open]').waitFor();assert.ok(await page.locator('.egg-dialog').evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight;}));
 assert.ok(await page.locator('.egg-discovery-icon img').evaluateAll(imgs=>imgs.every(i=>i.getBoundingClientRect().height<=55)));assert.ok(await page.locator('.egg-discovery').evaluateAll(cards=>cards.every(c=>c.scrollWidth<=c.clientWidth+1)));await page.screenshot({path:'easter-eggs-mobile-check.png'});await page.locator('.egg-discovery').filter({hasText:'pedro'}).click();await page.locator('.egg-art').waitFor();await page.keyboard.press('Escape');
 await page.emulateMedia({reducedMotion:'reduce'});await open.click();await page.locator('.egg-discovery').filter({hasText:'pedro'}).click();assert.ok((await page.locator('.egg-art').getAttribute('src')).endsWith('pedro-still.webp'));await page.keyboard.press('Escape');
 await page.goto('http://127.0.0.1:5196/FEH-Rerun-Schedule-by-Clustifle/settings/personalization');for(const theme of ['Midgard','Múspell','Ásgarðr']){await page.getByText(theme,{exact:true}).click();await page.locator('.settings-inline').getByRole('button',{name:'Open Anna’s Secret Stash',exact:true}).click();await page.locator('.egg-dialog[open]').waitFor();assert.ok(await page.locator('.egg-dialog').evaluate(e=>getComputedStyle(e).color!=='rgba(0, 0, 0, 0)'));await page.keyboard.press('Escape');}await page.getByLabel('Hidden surprises').uncheck();assert.equal(await page.locator('.egg-stash-launcher').count(),0);await page.keyboard.type('ferran');assert.equal(await page.locator('.egg-dialog[open]').count(),0);
 assert.deepEqual(errors,[]);console.log('Easter eggs: 12 working discoveries, audio, spooky opt-in, persistence, keyboard triggers, mobile, reduced motion and disable setting passed.');
}finally{await browser.close();}
