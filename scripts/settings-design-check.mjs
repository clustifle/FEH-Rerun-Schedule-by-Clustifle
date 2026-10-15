import {chromium} from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const p=await browser.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>localStorage.setItem('feh-preferences',JSON.stringify({autoRefresh:false,carouselAutoplay:false})));
 await p.route('**/rest/v1/**',r=>r.fulfill({json:new URL(r.request().url()).pathname.endsWith('tracker_role')?'Visitor':[]}));
 await p.goto('http://127.0.0.1:5196/FEH-Rerun-Schedule-by-Clustifle/');
 await p.getByRole('button',{name:'Open navigation menu'}).click();
 await p.getByRole('button',{name:'Settings',exact:true}).click();
 const settings=p.locator('.minimal-settings');await settings.waitFor();
 for(const width of [1280,768,390,320]){
  await p.setViewportSize({width,height:844});
  for(const theme of ['fire-emblem-heroes','midgard','hel']){
   await p.evaluate(t=>document.documentElement.dataset.theme=t,theme);
   await settings.getByRole('navigation',{name:'Settings sections'}).getByRole('button',{name:'Personalization',exact:true}).click();
   assert.ok(await settings.locator('.settings-body').isVisible());
   assert.ok(await settings.locator('.settings-sections button').first().evaluate(e=>getComputedStyle(e,'::before').backgroundImage.includes('compact-menu-button')));
   assert.ok(await p.locator('.has-settings[open]').evaluate(e=>getComputedStyle(e,'::after').backgroundImage.includes('compact-menu-window')));
   assert.ok(await settings.evaluate(e=>e.scrollWidth<=e.clientWidth+1),'settings overflow '+width);
   const bounds=await p.locator('.has-settings[open]').boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=width+1);
   assert.equal(await settings.locator('.settings-group').first().evaluate(e=>getComputedStyle(e).backgroundImage),'none');
  }
  await p.screenshot({path:'settings-minimal-'+width+'.png'});
 }
 await settings.locator('.settings-row').filter({hasText:'Compact view by default'}).locator('input').check();
 assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('feh-preferences')).compact),true);
 await settings.locator('input[value=midgard]').check();assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('feh-preferences')).theme),'midgard');
 const sections=settings.getByRole('navigation',{name:'Settings sections'});
 await sections.getByRole('button',{name:'Date & time',exact:true}).click();
 await settings.locator('.settings-row').filter({hasText:'Clock format'}).locator('select').selectOption('24');
 assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('feh-preferences')).clock),'24');
 await sections.getByRole('button',{name:'Updates',exact:true}).click();await settings.getByRole('button',{name:'Refresh now',exact:true}).waitFor();
 await sections.getByRole('button',{name:'About',exact:true}).click();assert.ok(await settings.locator('.settings-body').isVisible());
   assert.ok(await settings.locator('.settings-sections button').first().evaluate(e=>getComputedStyle(e,'::before').backgroundImage.includes('compact-menu-button')));
   assert.ok(await p.locator('.has-settings[open]').evaluate(e=>getComputedStyle(e,'::after').backgroundImage.includes('compact-menu-window')));
 await sections.getByRole('button',{name:'Personalization',exact:true}).click();await settings.getByRole('button',{name:'Reset settings',exact:true}).click();await settings.getByRole('button',{name:'Cancel',exact:true}).click();assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('feh-preferences')).compact),true);
 await p.locator('.settings-mobile-back').click();await p.getByRole('button',{name:'Skills List',exact:true}).waitFor();
 assert.deepEqual(errors,[]);console.log('Settings: themed 320/390/768/1280 layouts, visible mobile sections, theme and preference persistence, reset cancellation, Updates/About and return to menu passed.');
}catch(e){await browser.contexts()[0].pages()[0].screenshot({path:'settings-failure.png'});throw e;}finally{await browser.close();}

