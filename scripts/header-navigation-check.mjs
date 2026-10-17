import {chromium} from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{Object.defineProperty(navigator,'deviceMemory',{get:()=>8});Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>16});localStorage.setItem('feh-preferences',JSON.stringify({autoRefresh:false,carouselAutoplay:false}));});
 await p.route('**/rest/v1/**',r=>r.fulfill({json:new URL(r.request().url()).pathname.endsWith('tracker_role')?'Visitor':[]}));
 await p.goto('http://127.0.0.1:5196/FEH-Rerun-Schedule-by-Clustifle/');
 const nav=p.getByRole('navigation',{name:'Primary navigation'});await nav.waitFor();
 assert.deepEqual(await nav.locator(':scope > a, :scope > details > summary').allTextContents(),['Home','Schedule','Waitlist','All Heroes','Forum']);
 for(const theme of ['fire-emblem-heroes','midgard','hel'])for(const width of [320,390,768,1280]){
  await p.evaluate(t=>document.documentElement.dataset.theme=t,theme);await p.setViewportSize({width,height:900});
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),theme+' overflow '+width);
  const boxes=await nav.locator(':scope > a, :scope > details').evaluateAll(nodes=>nodes.map(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right};}));
  assert.ok(boxes.every((b,i)=>b.left>=0&&b.right<=width+1&&(!i||b.left>=boxes[i-1].right-1)),theme+' overlapping links '+width);
  await nav.locator('summary').filter({hasText:'Schedule'}).click();assert.equal(await nav.locator('details[open] a').count(),8);
  const options=await nav.locator('details[open] .header-navigation-options').boundingBox();assert.ok(options.x>=0&&options.x+options.width<=width+1);
  await p.keyboard.press('Escape');assert.equal(await nav.locator('details[open]').count(),0);
 }
 await nav.locator('summary').filter({hasText:'Waitlist'}).click();assert.equal(await nav.locator('details[open] a').count(),4);
 await p.waitForFunction(()=>!document.querySelector('.header-primary-navigation [aria-disabled=true]'));await nav.getByRole('link',{name:'Remix Waitlist',exact:true}).click();await p.waitForURL('**/rerun-waitlist/remix');assert.equal(await nav.locator('details[open]').count(),0);
 await p.waitForFunction(()=>!document.querySelector('.header-primary-navigation [aria-disabled=true]'));await nav.getByRole('link',{name:'All Heroes',exact:true}).click();await p.waitForURL('**/all-heroes');
 await p.waitForFunction(()=>!document.querySelector('.header-primary-navigation [aria-disabled=true]'));await nav.getByRole('link',{name:'Forum',exact:true}).click();await p.waitForURL('**/community');
 await p.waitForFunction(()=>!document.querySelector('.header-primary-navigation [aria-disabled=true]'));await p.locator('.masthead').getByRole('link',{name:'Profile',exact:true}).click();await p.waitForURL('**/profile');
 await p.waitForFunction(()=>!document.querySelector('.header-primary-navigation [aria-disabled=true]'));await nav.getByRole('link',{name:'Home',exact:true}).click();await p.waitForURL('**/home');
 await p.getByRole('button',{name:'Open navigation menu'}).click();const menu=p.getByRole('dialog',{name:'Navigation',exact:true});await menu.waitFor();await menu.getByRole('button',{name:'Skills List',exact:true}).waitFor();await menu.getByRole('button',{name:'Find Users',exact:true}).waitFor();for(const name of ['Home','Schedule','Waitlist','All Heroes','Forum','Profile'])assert.equal(await menu.getByRole('button',{name,exact:true}).count(),0);for(const width of [320,390,1280]){await p.setViewportSize({width,height:844});assert.ok(await menu.evaluate(e=>e.scrollWidth<=e.clientWidth+1));const bounds=await menu.boundingBox();assert.ok(bounds.width<=Math.min(360,width-32)+1);assert.ok(bounds.height<700);assert.ok(bounds.width<=Math.min(304,width-32)+1);assert.ok(await menu.getByRole('button',{name:'Skills List',exact:true}).evaluate(e=>getComputedStyle(e,'::before').backgroundImage.includes('compact-menu-button')));await p.screenshot({path:'minimal-navigation-menu-'+width+'.png'});}await menu.getByRole('button',{name:'Settings',exact:true}).click();await menu.locator('.settings-inline').waitFor();await menu.locator('.settings-mobile-back').click();await menu.getByRole('button',{name:'Skills List',exact:true}).waitFor();await menu.getByRole('button',{name:'Close navigation menu'}).click();
 await p.evaluate(()=>{document.documentElement.dataset.theme='fire-emblem-heroes';document.body.style.minHeight='2500px';});
 const header=p.locator('.masthead');const expanded=await header.evaluate(e=>e.getBoundingClientRect().height);const logoWidth=await header.locator('.feh-wordmark img').evaluate(e=>e.offsetWidth),navFont=await nav.evaluate(e=>getComputedStyle(e).fontSize);
 await p.evaluate(()=>window.scrollTo(0,300));await p.waitForFunction(()=>document.querySelector('.masthead').classList.contains('is-compact'));
 await p.waitForFunction(h=>document.querySelector('.masthead').getBoundingClientRect().height<h,expanded);await p.waitForTimeout(250);assert.ok(await nav.evaluate(e=>new DOMMatrix(getComputedStyle(e).transform).a<1));assert.equal(await header.locator('.feh-wordmark img').evaluate(e=>e.offsetWidth),logoWidth);assert.equal(await nav.evaluate(e=>getComputedStyle(e).fontSize),navFont);await p.evaluate(()=>document.documentElement.dataset.resourceBudget='limited');assert.ok(await nav.evaluate(e=>parseFloat(getComputedStyle(e).transitionDuration)>0));
 await p.evaluate(()=>document.documentElement.dataset.motion='reduced');assert.equal(await nav.evaluate(e=>parseFloat(getComputedStyle(e).transitionDuration)),0);await p.evaluate(()=>document.documentElement.dataset.motion='device');
 await p.evaluate(()=>window.scrollTo(0,0));await p.waitForFunction(()=>!document.querySelector('.masthead').classList.contains('is-compact'));

 for(const width of [1280,390]){await p.setViewportSize({width,height:900});await p.screenshot({path:'header-navigation-'+width+'.png'});}
 assert.deepEqual(errors,[]);console.log('Primary links, eight schedules, four waitlists, profile, retained menu links, Escape, themed layout and 320/390/768/1280px widths passed.');
}finally{await browser.close();}
