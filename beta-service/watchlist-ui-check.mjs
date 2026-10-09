import {chromium} from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{const page=await browser.newPage({viewport:{width:390,height:844}});let rows=[{hero_id:'11111111-1111-4111-8111-111111111111',list_name:'Following'}];
await page.route('**/_beta/api/watchlist',route=>{if(route.request().method()==='POST'){const b=route.request().postDataJSON();rows=b.follow?rows.map(r=>({...r,list_name:b.list_name})):[];return route.fulfill({json:{ok:true}});}return route.fulfill({json:rows});});
await page.goto('http://127.0.0.1:5192/beta-service/ui-test.html?section=watchlist');await page.getByRole('button',{name:/Ike/}).waitFor();
await page.getByRole('combobox',{name:'Collection for Ike'}).selectOption('Merge project');assert.equal(rows[0].list_name,'Merge project');
await page.getByRole('searchbox',{name:'Search my watchlist'}).fill('Lyn');await page.getByText('No saved heroes match these filters.').waitFor();
await page.getByRole('searchbox',{name:'Search my watchlist'}).fill('');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
await page.getByRole('button',{name:'Remove',exact:true}).click();await page.getByText('Your watchlist starts with a hero').waitFor();assert.equal(rows.length,0);console.log('Watchlist collection editing, search, removal, empty state and mobile width passed.');
}finally{await browser.close();}
