import {chromium} from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
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
 const tools=p.getByRole('region',{name:'Schedule tools'}),select=tools.getByRole('combobox',{name:'Schedule view'});
 await tools.waitFor();assert.equal(await select.inputValue(),'General');
 await tools.getByText('How to read dates and predictions').click();await tools.getByText('A staff estimate that may change.',{exact:false}).waitFor();
 await tools.getByRole('button',{name:'Copy page link'}).click();await tools.getByRole('status').filter({hasText:'Page link copied'}).waitFor();assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),p.url());
 for(const view of ['Remix','Monthly Revival','Weekly Revivals','Forging Bonds Revival','Hall of Forms Revival','Refine Predictions','Schedule Under Consideration','Waitlist','DSH Waitlist','NHR Waitlist','Remix Waitlist','General']){
  await select.selectOption(view);await p.waitForFunction(value=>document.querySelector('select[aria-label="Schedule view"]')?.value===value,view);await tools.locator('.schedule-date-guidance').waitFor();assert.ok((await tools.locator('.schedule-date-guidance').innerText()).length>30);
 }
 await select.selectOption('Schedule Under Consideration');await p.waitForFunction(()=>document.querySelector('select[aria-label="Schedule view"]')?.value==='Schedule Under Consideration');
 await p.getByRole('button',{name:'Share or export schedule',exact:true}).click();const dialog=p.getByRole('dialog',{name:'Export schedule image'});
 try{await dialog.getByRole('button',{name:'Download PNG',exact:true}).waitFor();}catch(e){console.log(await dialog.innerText());throw e;}
 assert.ok((await p.evaluate(()=>window.exportText)).includes('Waitlists and entries under consideration: dates not confirmed.'));
 await dialog.getByText('Customize image',{exact:true}).click();await p.evaluate(()=>{window.exportText=[];});await dialog.getByLabel('Show website footer').uncheck();
 await p.waitForFunction(()=>window.exportText.includes('Waitlists and entries under consideration: dates not confirmed.'));
 assert.ok((await p.evaluate(()=>window.exportText)).includes('Waitlists and entries under consideration: dates not confirmed.'));
 await dialog.getByRole('button',{name:'Close schedule export'}).click();
 for(const width of [320,390,768,1280]){await p.setViewportSize({width,height:960});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Page overflow '+width);}
 await tools.getByText('How to read dates and predictions').click();await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:'v31-schedule-desktop.png'});await p.setViewportSize({width:390,height:844});await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:'v31-schedule-mobile.png'});
 assert.deepEqual(errors,[]);console.log('v3.1: all schedule/waitlist routes, contextual date guide, clipboard sharing, uncertainty in exports, and four responsive widths passed.');
}finally{await browser.close();}
