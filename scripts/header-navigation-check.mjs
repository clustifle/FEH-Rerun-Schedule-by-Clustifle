import {chromium} from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>localStorage.setItem('feh-preferences',JSON.stringify({autoRefresh:false,carouselAutoplay:false})));
 await p.route('**/rest/v1/**',r=>r.fulfill({json:new URL(r.request().url()).pathname.endsWith('tracker_role')?'Visitor':[]}));
 await p.goto('http://127.0.0.1:5196/FEH-Rerun-Schedule-by-Clustifle/');
 const nav=p.getByRole('navigation',{name:'Primary navigation'});await nav.waitFor();
 assert.deepEqual(await nav.locator(':scope > a, :scope > details > summary').allTextContents(),['Home','Schedule','Waitlist','All Heroes','Forum']);
 for(const theme of ['fire-emblem-heroes','midgard','hel'])for(const width of [320,390,768,1280]){
  await p.evaluate(t=>document.documentElement.dataset.theme=t,theme);await p.setViewportSize({width,height:900});
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),theme+' overflow '+width);
  const boxes=await nav.locator(':scope > a, :scope > details').evaluateAll(nodes=>nodes.map(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right};}));
  assert.ok(boxes.every((b,i)=>b.left>=0&&b.right<=width+1&&(!i||b.left>=boxes[i-1].right-1)),theme+' overlapping links '+width);
  await nav.locator('summary').filter({hasText:'Schedule'}).click();assert.equal(await nav.locator('details[open] a').count(),7);
  const options=await nav.locator('details[open] .header-navigation-options').boundingBox();assert.ok(options.x>=0&&options.x+options.width<=width+1);
  await p.keyboard.press('Escape');assert.equal(await nav.locator('details[open]').count(),0);
 }
 await nav.locator('summary').filter({hasText:'Waitlist'}).click();assert.equal(await nav.locator('details[open] a').count(),4);
 await p.waitForFunction(()=>!document.querySelector('.header-primary-navigation [aria-disabled=true]'));await nav.getByRole('link',{name:'Remix Waitlist',exact:true}).click();await p.waitForURL('**/rerun-waitlist/remix');assert.equal(await nav.locator('details[open]').count(),0);
 await p.waitForFunction(()=>!document.querySelector('.header-primary-navigation [aria-disabled=true]'));await nav.getByRole('link',{name:'All Heroes',exact:true}).click();await p.waitForURL('**/all-heroes');
 await p.waitForFunction(()=>!document.querySelector('.header-primary-navigation [aria-disabled=true]'));await nav.getByRole('link',{name:'Forum',exact:true}).click();await p.waitForURL('**/community');
 await p.waitForFunction(()=>!document.querySelector('.header-primary-navigation [aria-disabled=true]'));await p.locator('.masthead').getByRole('link',{name:'Profile',exact:true}).click();await p.waitForURL('**/profile');
 await p.waitForFunction(()=>!document.querySelector('.header-primary-navigation [aria-disabled=true]'));await nav.getByRole('link',{name:'Home',exact:true}).click();await p.waitForURL('**/home');
 await p.getByRole('button',{name:'Open navigation menu'}).click();const menu=p.getByRole('dialog',{name:'Navigation',exact:true});await menu.waitFor();await menu.getByRole('button',{name:'Skills List',exact:true}).waitFor();await menu.getByRole('button',{name:'Find Users',exact:true}).waitFor();await menu.getByRole('button',{name:'Close navigation menu'}).click();
 await p.evaluate(()=>{document.documentElement.dataset.theme='fire-emblem-heroes';document.body.style.minHeight='2500px';});
 const header=p.locator('.masthead');const expanded=await header.evaluate(e=>e.getBoundingClientRect().height);
 await p.evaluate(()=>window.scrollTo(0,300));await p.waitForFunction(()=>document.querySelector('.masthead').classList.contains('is-compact'));
 assert.ok(await header.evaluate(e=>e.getBoundingClientRect().height)<expanded);
 await p.evaluate(()=>window.scrollTo(0,0));await p.waitForFunction(()=>!document.querySelector('.masthead').classList.contains('is-compact'));

 for(const width of [1280,390]){await p.setViewportSize({width,height:900});await p.screenshot({path:'header-navigation-'+width+'.png'});}
 assert.deepEqual(errors,[]);console.log('Primary links, seven schedules, four waitlists, profile, retained menu links, Escape, themed layout and 320/390/768/1280px widths passed.');
}finally{await browser.close();}
