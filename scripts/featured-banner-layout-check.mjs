import {chromium} from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 let count=3,bannerName='New Heroes: Test';
 const heroes=['Alfonse','Sharena','Anna','Fjorm'].map((name,i)=>({id:String(i),name,title:'Test Hero',category:'General',color:['Red','Blue','Green','Colorless'][i],portrait:'data/portraits/edfbaac5-3079-488c-b12e-c7b1333a5ee4.webp',schedule:'None',month:null,move_type:'Infantry',weapon_type:'Sword'}));
 await p.addInitScript(()=>localStorage.setItem('feh-preferences',JSON.stringify({autoRefresh:false,carouselAutoplay:false})));
 await p.route('**/rest/v1/**',r=>{const url=new URL(r.request().url());let data=[];if(url.pathname.endsWith('/heroes'))data=heroes;else if(url.pathname.endsWith('/tracker_banners'))data=[{id:'test-banner',name:bannerName,banner_type:'featured',starts_on:'2020-01-01',ends_on:'2099-01-01',starts_time:'07:00',ends_time:'06:59',slot_count:4,tracker_banner_heroes:heroes.slice(0,count).map((h,i)=>({hero_id:h.id,slot_index:[0,2,3,1][i]}))}];else if(url.pathname.endsWith('tracker_role'))data='Visitor';return r.fulfill({json:data});});
 for(const name of ['New Heroes: Test','Special Heroes: Test'])for(const size of [3,4]){
  bannerName=name;count=size;await p.goto('http://127.0.0.1:5196/FEH-Rerun-Schedule-by-Clustifle/');
  const lineup=p.locator('.featured-banner-heroes').first();await lineup.locator('.featured-banner-hero').nth(size-1).waitFor();
  assert.equal(await lineup.locator('.featured-banner-hero').count(),size);assert.equal(await lineup.locator('.featured-banner-empty').count(),0);
  for(const width of [320,390,768,1280]){
   await p.setViewportSize({width,height:900});
   const columns=await lineup.evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length);
   assert.equal(columns,size===3?3:width<=760?2:4);
   const bounds=await lineup.boundingBox();for(const card of await lineup.locator('.featured-banner-hero').all()){const box=await card.boundingBox();assert.ok(box.x>=bounds.x-1&&box.x+box.width<=bounds.x+bounds.width+1);}
   assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  }
  if(size===3){await p.setViewportSize({width:390,height:844});await p.screenshot({path:'featured-three-heroes-mobile.png'});}
 }
 assert.deepEqual(errors,[]);console.log('New/Special Heroes: three and four heroes, non-consecutive saved slots, correct columns, and no overflow at 320/390/768/1280px passed.');
}finally{await browser.close();}
