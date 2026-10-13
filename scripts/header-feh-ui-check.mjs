import {chromium} from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{localStorage.setItem('feh-preferences',JSON.stringify({autoRefresh:false}));window.__surprises=0;window.addEventListener('ferran-search-surprise',()=>window.__surprises++);});
 await page.route('**/rest/v1/**',r=>r.fulfill({json:r.request().url().includes('tracker_role')?null:[]}));
 await page.route('**/feh-community-polls.shyguyvn.workers.dev/**',r=>r.fulfill({json:{polls:[],posts:[],user:null,connected:false,publicReady:false}}));
 const base='http://127.0.0.1:5196/FEH-Rerun-Schedule-by-Clustifle/';
 await page.goto(base+'home');const owl=page.getByRole('button',{name:'Interact with Feh',exact:true});await owl.waitFor();
 for(const mood of ['happy','sleepy','awake']){await owl.click();await page.waitForFunction(m=>document.querySelector('.header-feh img').src.endsWith('feh-'+m+'.png'),mood);}
 for(const width of [320,390,1280]){await page.setViewportSize({width,height:750});assert.ok(await owl.evaluate(e=>{const r=e.getBoundingClientRect(),logo=document.querySelector('.feh-wordmark img').getBoundingClientRect(),menu=document.querySelector('[aria-controls="mobile-navigation"]').getBoundingClientRect();return r.left>=logo.right&&r.right<=menu.left;}));}
 await page.emulateMedia({reducedMotion:'reduce'});await owl.click();assert.equal(await page.locator('.header-feh img').evaluate(e=>getComputedStyle(e).animationName),'none');
 await page.screenshot({path:'feh-only-header-check.png'});
 for(const route of ['home','skills','schedule/weekly-revivals','rerun-waitlist/lme','faq','schedule/general']){await page.goto(base+route);await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));assert.equal(await page.locator('[data-egg-mount],.egg-direct,.ferran-scene').count(),0);}
 await page.goto(base+'users');const input=page.getByRole('searchbox',{name:'Search users',exact:true});await input.fill('Ferran');await input.press('Enter');await page.locator('.user-search-count').waitFor();assert.equal(await page.evaluate(()=>window.__surprises),0);assert.equal(await page.locator('.ferran-scene').count(),0);
 assert.deepEqual(errors,[]);console.log('Feh expressions, header spacing, reduced motion, removed Easter eggs and normal Ferran search passed.');
}finally{await browser.close();}
