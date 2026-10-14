import {chromium} from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const heroes=Array.from({length:2005},(_,i)=>({id:String(i),name:'Hero '+String(i).padStart(4,'0'),title:'Low resource test',category:'General',color:'Red',pool:'General Pool',schedule:'None',month:null,portrait:null,move_type:'Infantry',weapon_type:'Sword'}));
try{
 for(const touch of [false,true]){
  const context=await browser.newContext({viewport:touch?{width:390,height:844}:{width:1280,height:900},hasTouch:touch,isMobile:touch});
  const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{Object.defineProperty(navigator,'deviceMemory',{get:()=>4});Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>4});localStorage.setItem('feh-preferences',JSON.stringify({autoRefresh:false}));});
  const cdp=await context.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:6});
  await p.route('**/rest/v1/**',r=>{const url=new URL(r.request().url());if(url.pathname.endsWith('/heroes')){const offset=Number(url.searchParams.get('offset')||0);return r.fulfill({json:heroes.slice(offset,offset+1000)});}return r.fulfill({json:url.pathname.endsWith('tracker_role')?'Visitor':[]});});
  await p.goto('http://127.0.0.1:5196/FEH-Rerun-Schedule-by-Clustifle/all-heroes');
  const directory=p.getByRole('region',{name:'All Heroes directory'}),batch=touch?48:96;
  await directory.getByRole('status').filter({hasText:'2005 of 2005 heroes'}).waitFor();
  assert.equal(await p.locator('html').getAttribute('data-resource-budget'),'limited');
  const view=directory.getByRole('combobox',{name:'Hero directory view'});
  for(const key of ['small','medium','large','list','details','tiles','content']){
   await view.selectOption(key);await directory.locator('.'+key+'-view').waitFor();
   const items=directory.locator(key==='details'?'tbody tr':'.all-heroes-card');assert.equal(await items.count(),batch);
   await directory.getByRole('button',{name:'Next',exact:true}).click();
   await items.first().getByText('Hero '+String(batch).padStart(4,'0'),{exact:true}).waitFor();
   assert.equal(await items.count(),batch);
   await directory.getByRole('button',{name:'Previous',exact:true}).click();
   await items.first().getByText('Hero 0000',{exact:true}).waitFor();
   assert.ok(await directory.evaluate(e=>e.scrollWidth<=e.clientWidth+1));
  }
  await view.selectOption('medium');
  for(let i=1;i<Math.ceil(2005/batch);i++)await directory.getByRole('button',{name:'Next',exact:true}).click();
  await directory.getByRole('button',{name:'View Hero 2004 · Low resource test'}).waitFor();
  assert.ok(await directory.locator('.all-heroes-card').count()<=batch);
  assert.equal(await directory.getByRole('button',{name:'Next',exact:true}).isDisabled(),true);
  await directory.getByRole('searchbox',{name:'Search all heroes'}).fill('Hero 1999');
  await directory.getByRole('status').filter({hasText:'1 of 2005 heroes'}).waitFor();
  assert.equal(await directory.locator('.all-heroes-card').count(),1);
  await directory.getByRole('searchbox',{name:'Search all heroes'}).fill('');
  await directory.getByRole('status').filter({hasText:'2005 of 2005 heroes'}).waitFor();
  await p.screenshot({path:touch?'all-heroes-low-memory-android.png':'all-heroes-low-memory-desktop.png'});
  assert.deepEqual(errors,[]);await context.close();
 }
 console.log('Low-memory desktop and Android touch: all seven views keep 96/48 cards mounted, reach all 2,005 heroes, search across pages and fit the viewport under 6x CPU throttling.');
}finally{await browser.close();}
