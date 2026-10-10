import {chromium} from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try {
const p=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('**/rest/v1/**',r=>r.fulfill({json:[]}));
for(const width of [390,1280]){await p.setViewportSize({width,height:844});await p.goto('http://127.0.0.1:5193/FEH-Rerun-Schedule-by-Clustifle/schedule/general');
for(const schedule of ['Remix Schedule','L/M/E Schedule','L/M Revival Schedule','Remix Schedule']) {
await p.getByRole('button',{name:'Share or export schedule',exact:true}).click();
await p.getByRole('button',{name:'Close schedule export',exact:true}).click();
await p.getByRole('button',{name:'Open navigation menu'}).click();await p.getByRole('button',{name:'Schedule',exact:true}).click();await p.getByRole('button',{name:schedule,exact:true}).click();await p.waitForTimeout(1000);
assert.equal(await p.locator('.schedule-export-launch').count(),1);assert.equal(await p.locator('dialog[open]').count(),0);
}
await p.getByRole('button',{name:'Share or export schedule',exact:true}).click();assert.equal(await p.locator('.schedule-export-dialog[open]').count(),1);await p.getByRole('button',{name:'Close schedule export',exact:true}).click();}assert.deepEqual(errors,[]);console.log('Desktop/mobile repeated sharing and schedule switching passed.');
}finally{await b.close();}
