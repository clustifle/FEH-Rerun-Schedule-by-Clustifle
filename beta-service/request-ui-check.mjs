import {chromium} from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{const page=await browser.newPage();let reads=0;await page.route('**/_beta/api/heroes',async r=>{reads++;await new Promise(resolve=>setTimeout(resolve,100));return r.fulfill({json:[{id:'test'}]});});await page.route('**/_beta/api/versions',r=>r.fulfill({json:[]}));await page.route('**/_beta/api/failed',r=>r.fulfill({status:400,json:{error:'The selected hero changed. Refresh and try again.'}}));await page.route('**/_beta/api/stalled',()=>{});
await page.goto('http://127.0.0.1:5192/beta-service/ui-test.html');
const rows=await page.evaluate(async()=>{const {apiFetch}=await import('/pages-app/static-data.ts');const responses=await Promise.all([apiFetch('/api/heroes'),apiFetch('/api/heroes')]);return Promise.all(responses.map(r=>r.json()));});assert.equal(reads,1);assert.deepEqual(rows,[[{id:'test'}],[{id:'test'}]]);
const message=await page.evaluate(async()=>{const {betaRequest}=await import('/pages-app/beta.ts');try{await betaRequest('failed');}catch(e){return e.message;}});assert.match(message,/selected hero changed/);
const timeout=await page.evaluate(async()=>{const {betaRequest}=await import('/pages-app/beta.ts');try{await betaRequest('stalled');}catch(e){return e.message;}});assert.match(timeout,/request timed out/);console.log('Beta requests preserve server errors and stop stalled requests with a retry message.');
}finally{await browser.close();}
