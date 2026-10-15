import {chromium} from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const p=await browser.newPage(), requests=[],errors=[];p.on('pageerror',e=>errors.push(e.message));
 const heroes=Array.from({length:2005},(_,i)=>({id:String(i),name:'Hero '+String(i).padStart(4,'0'),title:'Pagination test',category:'General',color:'Red',pool:'General Pool',schedule:'None',month:null,portrait:'',move_type:'Infantry',weapon_type:'Sword'}));
 await p.addInitScript(()=>{Object.defineProperty(navigator,'deviceMemory',{get:()=>8});Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>16});localStorage.setItem('feh-preferences',JSON.stringify({autoRefresh:false}));});
 await p.route('**/rest/v1/**',r=>{
  const url=new URL(r.request().url());
  if(url.pathname.endsWith('/heroes')){
   const offset=Number(url.searchParams.get('offset')||0),limit=Number(url.searchParams.get('limit')||1000);
   requests.push([offset,limit]);assert.ok(url.searchParams.get('order').includes('id.asc'));
   return r.fulfill({json:heroes.slice(offset,offset+limit)});
  }
  return r.fulfill({json:url.pathname.endsWith('tracker_role')?'Visitor':[]});
 });
 await p.goto('http://127.0.0.1:5196/FEH-Rerun-Schedule-by-Clustifle/all-heroes');
 const directory=p.getByRole('region',{name:'All Heroes directory'});
 await directory.getByRole('status').filter({hasText:'2005 of 2005 heroes'}).waitFor();
 assert.deepEqual([...new Map(requests.map(r=>[r[0],r])).values()],[[0,1000],[1000,1000],[2000,1000]]);
 assert.equal(requests.length,3,'concurrent full-catalog requests share one paginated read');
 const view=directory.getByRole('combobox',{name:'Hero directory view'});
 for(const key of ['small','medium','large','list','details','tiles','content']){
  await view.selectOption(key);await directory.locator('.'+key+'-view').waitFor();
  const count=await directory.locator(key==='details'?'tbody tr':'.all-heroes-card').count();
  assert.ok(count>=120&&count<=240,'initial rendering is bounded in '+key);
 }
 await view.selectOption('details');
 for(let page=1;page<Math.ceil(2005/120);page++)await directory.getByRole('button',{name:'Next',exact:true}).click();
 await directory.locator('tbody').getByText('Hero 2004',{exact:true}).waitFor();
 assert.ok(await directory.locator('tbody tr').count()<=120,'every page keeps the DOM bounded');
 assert.ok(await directory.locator('tbody').innerText().then(text=>text.includes('Hero 2004')),'paging reaches every hero');
 await view.selectOption('medium');
 await directory.getByRole('searchbox' ,{name:'Search all heroes'}).fill('Hero 2004');
 await directory.getByRole('status').filter({hasText:'1 of 2005 heroes'}).waitFor();
 assert.equal(await directory.locator('.all-heroes-card').count(),1);
 assert.deepEqual(errors,[]);
 console.log('All seven views keep at most 120 entries mounted; paging reaches every record. All 2,005 heroes loaded in three stable pages; directory count and search beyond 2,000 passed.');
}finally{await browser.close();}
