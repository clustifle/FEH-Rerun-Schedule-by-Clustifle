import {chromium} from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const p=await browser.newPage({viewport:{width:1280,height:960}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{window.originDraws=0;const draw=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(img,...args){if(img.src?.includes('game-origins'))window.originDraws++;return draw.call(this,img,...args)};});
 const hero={id:'11111111-1111-4111-8111-111111111111',name:'Altina',title:'Cross-Time Duo',category:'Harmonized',color:'Red',portrait:null,pool:'Seasonal Limited',month:'2026-10',schedule:'General',weapon_type:'Sword',move_type:'Infantry',notes:'',updated:'2026-10-22T00:00:00Z'};
 const nonPair={...hero,id:'22222222-2222-4222-8222-222222222222',name:'Canis',title:'Ill Portent',category:'General'};
 await p.route('**/rest/v1/**',r=>{const path=new URL(r.request().url()).pathname;if(!path.includes('/rpc/'))assert.equal(r.request().method(),'GET');return r.fulfill({json:path.endsWith('/heroes')?[hero,nonPair]:[]})});
 await p.goto('http://127.0.0.1:5197/FEH-Rerun-Schedule-by-Clustifle/schedule/general?month=2026-10');
 const marks=p.locator('.portrait-marks').filter({has:p.locator('.directory-origin-icons')}).first();await marks.waitFor();
 for(const width of [1280,390]){await p.setViewportSize({width,height:960});assert.equal(await marks.locator('.directory-origin-icons').count(),1);assert.equal(await marks.locator('.directory-origin-icons img').count(),2);const result=await marks.evaluate(e=>{const type=e.querySelector('.type-mark').getBoundingClientRect(),icons=[...e.querySelectorAll('.directory-origin-icons img')].map(i=>i.getBoundingClientRect());return {size:Math.abs(type.width-icons[0].width),left:Math.abs(type.left-icons[0].left),above:icons[1].bottom<=type.top,stack:icons[1].top>icons[0].bottom}});assert.ok(result.size<1&&result.left<1&&result.above&&result.stack,JSON.stringify(result));}
 const normal=p.locator('[data-hero-preview-id="22222222-2222-4222-8222-222222222222"] .portrait-marks').first();const stack=await normal.evaluate(e=>{const icons=[...e.querySelectorAll('.directory-origin-icons img')].map(i=>i.getBoundingClientRect());return icons.length===2&&Math.abs(icons[0].left-icons[1].left)<1&&icons[1].top>icons[0].bottom});assert.ok(stack,'non-paired multi-origin hero also stacks vertically');
 await p.getByRole('button',{name:'Share or export schedule',exact:true}).click();await p.getByRole('dialog',{name:'Export schedule image'}).getByRole('button',{name:'Download PNG',exact:true}).waitFor();assert.ok(await p.evaluate(()=>window.originDraws>=4),'all origin icons drawn in PNG preview');await p.screenshot({path:'shared-portrait-export.png'});
 assert.deepEqual(errors,[]);console.log('Shared schedule portraits at desktop/mobile and PNG origin rendering passed.');
}finally{await browser.close();}
