import {chromium} from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const base='http://127.0.0.1:5196/FEH-Rerun-Schedule-by-Clustifle/';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const id='11111111-1111-4111-8111-111111111111',category={id:'general',name:'General',slug:'general',isAnswerable:false};
const user={id,aud:'authenticated',role:'authenticated',identities:[{provider:'github',identity_data:{provider_id:'123',user_name:'member'}}]};
const token='eyJhbGciOiJIUzI1NiJ9.'+Buffer.from(JSON.stringify({sub:id,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.signature';
let cloud={draft:null,revision:0,updatedAt:null},published=null;const errors=[];
async function device(width=1280){
 const ctx=await browser.newContext({viewport:{width,height:850},reducedMotion:'reduce'}),p=await ctx.newPage();const state={offline:false};p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(({user,token})=>{localStorage.setItem('sb-aknsqeqykjgdyhdroqcx-auth-token',JSON.stringify({access_token:token,refresh_token:'test-refresh',expires_at:Math.floor(Date.now()/1000)+3600,expires_in:3600,token_type:'bearer',user}));localStorage.setItem('feh-preferences',JSON.stringify({autoRefresh:false,carouselAutoplay:false}));},{user,token});
 await p.route('**/auth/v1/user',r=>r.fulfill({json:user}));
 await p.route('**/rest/v1/**',r=>r.fulfill({json:r.request().url().includes('tracker_role')?'Owner':r.request().url().includes('tracker_profiles')?[{id,username:'member'}]:[]}));
 await p.route('https://feh-community-polls.shyguyvn.workers.dev/community/**',async r=>{
  const path=new URL(r.request().url()).pathname,method=r.request().method();
  if(path==='/community/draft'){
   if(state.offline)return r.abort('internetdisconnected');
   if(method==='GET')return r.fulfill({json:cloud});
   const b=r.request().postDataJSON();if(b.revision!==cloud.revision)return r.fulfill({status:409,json:{error:'Draft changed',...cloud}});
   cloud={draft:method==='DELETE'?null:{title:b.title,body:b.body,category:b.category,flair:b.flair},revision:cloud.revision+1,updatedAt:new Date().toISOString()};return r.fulfill({json:cloud});
  }
  if(path.endsWith('/session'))return r.fulfill({json:{user:{website_id:id,github_id:'123',login:'member',username:'member',role:'owner',can_vote:true},connected:true,publicReady:true}});
  if(path.endsWith('/rules'))return r.fulfill({json:{rules:[],revision:0}});
  if(path.endsWith('/categories'))return r.fulfill({json:{categories:[category]}});
  if(path==='/community/posts'&&method==='POST'){
   const b=r.request().postDataJSON();published={id:'post-1',number:1,title:b.title,body:b.body,category,flair:b.flair,author:{login:'member',websiteUsername:'member'},commentCount:{totalCount:0},comments:{nodes:[],totalCount:0,pageInfo:{hasNextPage:false}},createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),upvoteCount:0};
   assert.equal(b.draftRevision,cloud.revision);cloud={draft:null,revision:cloud.revision+1,updatedAt:new Date().toISOString()};return r.fulfill({json:{discussion:{number:1},draftCleared:true,draftRevision:cloud.revision}});
  }
  if(path==='/community/posts/1')return r.fulfill({json:{post:published}});
  return r.fulfill({json:{posts:published?[published]:[],pageInfo:{hasNextPage:false}}});
 });
 await p.goto(base+'community/');await p.getByRole('button',{name:'New post',exact:true}).waitFor();await p.getByRole('button',{name:'New post',exact:true}).click();await p.getByLabel('Post content',{exact:true}).waitFor();
 return {p,state,ctx};
}
const body=p=>p.getByLabel('Post content',{exact:true});
const saved=p=>p.getByText('Saved across devices',{exact:true}).waitFor();
const refresh=p=>p.getByRole('button',{name:'Sync now',exact:true}).click();
try{
 const a=await device();await a.p.getByLabel('Title',{exact:true}).fill('Draft from desktop');await a.p.getByLabel('Post flair',{exact:true}).selectOption('quick-question');await body(a.p).fill('A draft shared between devices.');await saved(a.p);
 const b=await device(390);await saved(b.p);assert.equal(await b.p.getByLabel('Title',{exact:true}).inputValue(),'Draft from desktop');assert.equal(await b.p.getByLabel('Post flair',{exact:true}).inputValue(),'quick-question');assert.match(await body(b.p).innerText(),/shared between devices/);
 await body(a.p).fill('Latest text from desktop.');await saved(a.p);await refresh(b.p);await b.p.waitForFunction(()=>document.querySelector('[aria-label="Post content"]').textContent.includes('Latest text'));
 b.state.offline=true;await body(b.p).fill('Offline phone version.');await b.p.getByText(/sync unavailable/).waitFor();assert.match(await body(b.p).innerText(),/Offline phone/);
 await body(a.p).fill('Another desktop version.');await saved(a.p);b.state.offline=false;await refresh(b.p);await b.p.getByRole('region',{name:'Draft conflict'}).waitFor();assert.match(await body(b.p).innerText(),/Offline phone/);await b.p.getByRole('button',{name:/Use other device/ }).click();assert.match(await body(b.p).innerText(),/Another desktop/);
 b.state.offline=true;await body(b.p).fill('Phone choice.');await body(a.p).fill('Desktop choice.');await saved(a.p);b.state.offline=false;await refresh(b.p);await b.p.getByRole('region',{name:'Draft conflict'}).waitFor();await b.p.getByRole('button',{name:/Keep this device/ }).click();await saved(b.p);assert.equal(cloud.draft.body,'Phone choice.');
 await b.p.setViewportSize({width:320,height:700});assert.ok(await b.p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await b.p.screenshot({path:'forum-draft-sync-mobile.png'});
 await b.p.getByRole('button',{name:'Review post',exact:true}).click();await b.p.getByRole('button',{name:'Publish post',exact:true}).click();await b.p.getByRole('heading',{name:'Draft from desktop',exact:true}).waitFor();assert.equal(cloud.draft,null);
 await refresh(a.p);assert.equal(await a.p.getByLabel('Title',{exact:true}).inputValue(),'');assert.equal((await body(a.p).innerText()).trim(),'');
 await a.p.screenshot({path:'forum-draft-sync-desktop.png'});assert.deepEqual(errors,[]);
 console.log('Two isolated devices: all fields restore, remote refresh, offline recovery, both conflict choices, mobile layout, publish cleanup and no resurrection passed.');
}catch(error){for(const [index,ctx] of browser.contexts().entries())for(const p of ctx.pages()){console.log(index,await p.locator('.community-composer').innerText().catch(()=>''),cloud);await p.screenshot({path:'forum-draft-failure-'+index+'.png'});}throw error;}finally{await browser.close();}
