import {themes} from '../pages-app/themes.ts';
import rules from '../lib/forum-rules.json' with {type:'json'};
import {chromium} from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';import assert from 'node:assert/strict';
const base=process.env.SITE_UI_URL||'http://127.0.0.1:5197/FEH-Rerun-Schedule-by-Clustifle/';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 let draftRecord={draft:null,revision:0,updatedAt:null};let forumRole='owner';const page=await browser.newPage({viewport:{width:1280,height:850},reducedMotion:'reduce'}),errors=[],writes=[];
 page.on('pageerror',e=>errors.push(e.message));
 const id='11111111-1111-4111-8111-111111111111',user={id,aud:'authenticated',role:'authenticated',identities:[{provider:'github',identity_data:{provider_id:'123',user_name:'member'}}]},token='eyJhbGciOiJIUzI1NiJ9.'+Buffer.from(JSON.stringify({sub:id,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.signature';
 await page.addInitScript(({user,token})=>{localStorage.setItem('sb-aknsqeqykjgdyhdroqcx-auth-token',JSON.stringify({access_token:token,refresh_token:'test-refresh',expires_at:Math.floor(Date.now()/1000)+3600,expires_in:3600,token_type:'bearer',user}));localStorage.setItem('feh-preferences',JSON.stringify({autoRefresh:false,theme:'fire-emblem-heroes'}));},{user,token});
 await page.route('**/auth/v1/user',r=>r.fulfill({json:user}));
 await page.route('**/rest/v1/**',r=>{const url=r.request().url();return r.fulfill({json:url.includes('tracker_role')?(forumRole==='moderator'?null:'Owner'):url.includes('is_tracker_owner')?true:url.includes('tracker_profiles')?[{id,username:'member',display_name:'Member'}]:[]});});
 const category={id:'general',name:'General',slug:'general',isAnswerable:false};
 const post={id:'discussion-1',number:1,flair:'quick-question',title:'Rerun discussion',body:'## Heroes\n\n**Bold** and *italic*.\n\n| Hero | Month |\n| --- | --- |\n| Marth | November |\n\n- [x] Saved\n\n<script>window.communityXss=1</script>\n[Bad](javascript:alert(1))\n![Bad](data:image/svg+xml;base64,PHN2Zz4=)\n<details><summary>Spoiler</summary>Hidden thought</details>',url:'https://github.com/clustifle/FEH-Rerun-Schedule-by-Clustifle/discussions/1',createdAt:'2026-10-09T00:00:00Z',updatedAt:'2026-10-09T00:00:00Z',closed:false,locked:false,upvoteCount:2,viewerHasUpvoted:false,viewerCanUpdate:true,author:{login:'member',websiteUsername:'website-member',websiteProfileId:id,avatarUrl:'https://avatars.githubusercontent.com/u/123'},category,commentCount:{totalCount:1},comments:{totalCount:1,pageInfo:{hasNextPage:false},nodes:[{id:'comment-1',body:'A good prediction.',createdAt:'2026-10-09T00:00:00Z',isAnswer:false,author:{login:'friend',websiteUsername:'website-friend',websiteProfileId:'22222222-2222-4222-8222-222222222222',avatarUrl:'https://avatars.githubusercontent.com/u/456'},replies:{nodes:[{id:'nested-1',body:'A nested reply.',createdAt:'2026-10-09T00:00:00Z',isAnswer:false,upvoteCount:0,viewerHasUpvoted:false,viewerCanUpvote:true,author:{login:'friend',websiteUsername:'website-friend',avatarUrl:'https://avatars.githubusercontent.com/u/456'}}],totalCount:1}}]}};
 await page.route('https://feh-community-polls.shyguyvn.workers.dev/community/**',r=>{const url=new URL(r.request().url()),method=r.request().method();let data={};if(url.pathname==='/community/draft'){if(method==='GET')return r.fulfill({json:draftRecord});const b=r.request().postDataJSON();if(b.revision!==draftRecord.revision)return r.fulfill({status:409,json:{error:'Draft changed',...draftRecord}});draftRecord={draft:method==='DELETE'?null:{title:b.title,body:b.body,category:b.category,flair:b.flair},revision:draftRecord.revision+1,updatedAt:new Date().toISOString()};return r.fulfill({json:draftRecord});}if(method!=='GET'){if(url.pathname.endsWith('/upvote')){const vote=r.request().postDataJSON();const target=vote.commentId?post.comments.nodes.flatMap(c=>[c,...(c.replies?.nodes||[])]).find(c=>c.id===vote.commentId):post;if(target){target.viewerHasUpvoted=!vote.remove;target.upvoteCount=(target.upvoteCount||0)+(vote.remove?-1:1);}}writes.push({path:url.pathname,body:url.pathname.endsWith('/images')?{type:r.request().headers()['content-type'],size:r.request().postDataBuffer()?.length}:r.request().postDataJSON()});data=url.pathname.endsWith('/images')?{url:'https://example.com/picture.webp'}:url.pathname==='/community/posts'?{discussion:{number:1}}:{ok:true};}else if(url.pathname.endsWith('/rules'))data={rules,revision:0};else if(url.pathname.endsWith('/moderation/history'))data={actions:[]};else if(url.pathname.endsWith('/moderators'))data={users:[]};else if(url.pathname.endsWith('/session'))data={user:{github_id:'123',website_id:id,login:'member',username:'website-member',role:forumRole,can_vote:true},connected:true,publicReady:true};else if(url.pathname.endsWith('/categories'))data={categories:[category]};else if(url.pathname.endsWith('/posts/1'))data={post};else data={posts:[post],pageInfo:{hasNextPage:false}};if(method!=='GET'&&url.pathname.endsWith('/upvote')){const vote=r.request().postDataJSON();const target=vote.commentId?post.comments.nodes.flatMap(c=>[c,...(c.replies?.nodes||[])]).find(c=>c.id===vote.commentId):post;data={ok:true,result:{[vote.remove?'removeUpvote':'addUpvote']:{subject:{upvoteCount:target.upvoteCount,viewerHasUpvoted:target.viewerHasUpvoted}}}};}return r.fulfill({json:data});});

 let expired=true,readRetries=0,mutationAttempts=0;
 await page.route('**/community/posts**',r=>{
  if(r.request().method()!=='GET'){mutationAttempts++;return r.fulfill({status:401,json:{error:'GitHub authorization expired. Enable community posting again.'}});}
  if(expired&&r.request().headers().authorization)return r.fulfill({status:401,json:{error:'GitHub authorization expired. Enable community posting again.'}});
  if(!r.request().headers().authorization)readRetries++;
  return r.fulfill({json:new URL(r.request().url()).pathname.endsWith('/1')?{post}:{posts:[post],pageInfo:{hasNextPage:false}}});
 });
 await page.goto(base+'community/?post=1');
 await page.getByRole('button',{name:'Reconnect GitHub',exact:true}).waitFor();
 await page.getByRole('heading',{name:'Rerun discussion',exact:true}).waitFor();
 assert.ok(readRetries>0,'Expired personal authorization falls back to public read');
 await page.getByRole('button',{name:'Refresh community',exact:true}).click();
 await page.getByRole('button',{name:'Reconnect GitHub',exact:true}).waitFor();
 assert.equal(mutationAttempts,0,'Read recovery never posts');
 await page.route('**/auth/v1/settings',r=>r.fulfill({json:{external:{github:true}}}));
 await page.route('**/auth/v1/authorize**',r=>r.fulfill({contentType:'text/html',body:'GitHub reconnect test'}));
 await page.getByRole('button',{name:'Reconnect GitHub',exact:true}).click();
 await page.waitForURL('**/auth/v1/authorize**');
 await page.goto(base+'community/?post=1');
 const pending=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('feh-github-auth-return')));
 assert.equal(pending.intent,'community');assert.equal(pending.userId,id);assert.ok(pending.path.endsWith('community/?post=1'),'Reconnect preserves discussion URL');
 assert.deepEqual(errors,[]);console.log('Forum expiry: stale connection corrected, public reads recovered, refresh cannot hide reconnect, no write replay, OAuth discussion return preserved.');
}finally{await browser.close();}
