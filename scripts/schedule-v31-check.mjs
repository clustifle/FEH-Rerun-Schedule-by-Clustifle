import {chromium} from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {scheduleViews,waitingViews} from '../pages-app/schedule-context.ts';
const base='http://127.0.0.1:5197/FEH-Rerun-Schedule-by-Clustifle/';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const context=await browser.newContext({viewport:{width:1280,height:960},permissions:['clipboard-read','clipboard-write']}),p=await context.newPage(),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{localStorage.setItem('feh-preferences',JSON.stringify({autoRefresh:false}));window.exportText=[];const text=CanvasRenderingContext2D.prototype.fillText;CanvasRenderingContext2D.prototype.fillText=function(value,...args){window.exportText.push(value);return text.call(this,value,...args);};});
 const hero={id:'11111111-1111-4111-8111-111111111111',name:'Ike',title:'Of Radiance',category:'Legendary',color:'Red',portrait:null,pool:'L/M/E Pool',month:'2026-10',schedule:'General',weapon_type:'Sword',move_type:'Infantry'};
 await p.route('**/rest/v1/**',r=>{const path=new URL(r.request().url()).pathname;if(!path.includes('/rpc/'))assert.equal(r.request().method(),'GET','Preview must not write production records');return r.fulfill({json:path.endsWith('/heroes')?[hero,{...hero,id:'22222222-2222-4222-8222-222222222222',name:'Micaiah',schedule:'Schedule Under Consideration',month:null}]:path.endsWith('/tracker_extended_waitlist')?[{hero_id:'22222222-2222-4222-8222-222222222222',list_kind:'consideration',sort_order:0}]:[]});});
 await p.route('**/community/refines',r=>r.fulfill({json:{entries:[],revision:1,updatedAt:null}}));
 await p.goto(base+'schedule/general?month=2026-10');
 const tools=p.getByRole('region',{name:'Schedule tools'}),labels=new Map([...scheduleViews,...waitingViews]);
 async function choose(view){await tools.getByRole('tab',{name:waitingViews.some(([key])=>key===view)?'Waitlists':'Schedules',exact:true}).click();await tools.getByRole('button',{name:labels.get(view),exact:true}).click();await p.waitForFunction(value=>document.querySelector('.schedule-context')?.getAttribute('data-active')===value,view);}
 await tools.waitFor();assert.equal(await tools.getAttribute('data-active'),'General');
 const nav=p.getByRole('navigation',{name:'Primary navigation'});assert.equal(await nav.locator('details').count(),1);await nav.locator('summary').filter({hasText:'Schedule & Waitlist'}).click();await nav.getByRole('link',{name:'Remix Schedule',exact:true}).waitFor();await p.keyboard.press('Escape');assert.equal(await nav.locator('details[open]').count(),0);
 await tools.getByRole('tab',{name:'Schedules',exact:true}).focus();await p.keyboard.press('ArrowRight');assert.equal(await tools.getByRole('tab',{name:'Waitlists',exact:true}).getAttribute('aria-selected'),'true');await p.keyboard.press('ArrowLeft');
 await tools.getByText('About these dates').click();await tools.getByText('Predictions are estimates.',{exact:false}).waitFor();
 await tools.getByRole('button',{name:'Copy link',exact:true}).click();await tools.getByRole('status').filter({hasText:'Page link copied'}).waitFor();assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),p.url());
 for(const view of ['Remix','Monthly Revival','Weekly Revivals','Forging Bonds Revival','Hall of Forms Revival','Refine Predictions','Schedule Under Consideration','Waitlist','DSH Waitlist','NHR Waitlist','Remix Waitlist','General']){
  await choose(view);assert.equal(await tools.getByRole('button',{name:labels.get(view),exact:true}).getAttribute('aria-current'),'page');assert.equal(await p.locator('main.schedule-page-frame>.schedule-page-heading').count(),1,'Shared title for '+view);assert.ok(await tools.evaluate(e=>{const title=e.parentElement.querySelector(':scope>.schedule-page-heading');return title&&title.getBoundingClientRect().bottom<=e.getBoundingClientRect().top+1;}),'Title must precede switcher for '+view);assert.equal(await p.locator('.fb-schedule>.fb-heading').count(),0,'No duplicate revival title');
 }
 await choose('Schedule Under Consideration');
 await p.getByRole('button',{name:'Share or export schedule',exact:true}).click();const dialog=p.getByRole('dialog',{name:'Export schedule image'});
 try{await dialog.getByRole('button',{name:'Download PNG',exact:true}).waitFor();}catch(e){console.log(await dialog.innerText());throw e;}
 assert.ok((await p.evaluate(()=>window.exportText)).includes('Waitlists and entries under consideration: dates not confirmed.'));
 await dialog.getByText('Customize image',{exact:true}).click();await p.evaluate(()=>{window.exportText=[];});await dialog.getByLabel('Show website footer').uncheck();
 await p.waitForFunction(()=>window.exportText.includes('Waitlists and entries under consideration: dates not confirmed.'));
 assert.ok((await p.evaluate(()=>window.exportText)).includes('Waitlists and entries under consideration: dates not confirmed.'));
 await dialog.getByRole('button',{name:'Close schedule export'}).click();
 for(const width of [320,390,768,1280]){await p.setViewportSize({width,height:960});await p.evaluate(()=>scrollTo(0,0));assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Switcher overflow '+width);await nav.locator('summary').click();assert.ok(await nav.locator('.combined-navigation').evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1;}),'Combined header menu overflow '+width);await p.keyboard.press('Escape');}
 await tools.getByText('About these dates').click();await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:'v31-schedule-desktop.png'});await p.setViewportSize({width:390,height:844});await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:'v31-schedule-mobile.png'});
 assert.deepEqual(errors,[]);console.log('v3.1: all schedule/waitlist routes, contextual date guide, clipboard sharing, uncertainty in exports, and four responsive widths passed.');
}finally{await browser.close();}
