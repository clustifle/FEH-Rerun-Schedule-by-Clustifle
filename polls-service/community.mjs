import flairs from '../lib/community-flairs.json' with {type:'json'};
const REPO='clustifle/FEH-Rerun-Schedule-by-Clustifle',REPO_ID='R_kgDOU5Auog';
const postFields='id number title body url createdAt updatedAt closed locked upvoteCount viewerHasUpvoted viewerCanUpdate viewerCanDelete author{login avatarUrl} category{id name isAnswerable} commentCount:comments{totalCount}';
const commentFields='id body url createdAt isAnswer isMinimized viewerCanUpdate viewerCanDelete author{login avatarUrl}';
class CommunityError extends Error{constructor(status,message){super(message);this.status=status;}}
const fail=(s,m)=>{throw new CommunityError(s,m);};
const statement=(e,q,...v)=>e.DB.prepare(q).bind(...v),one=(e,q,...v)=>statement(e,q,...v).first();
const time=()=>Math.floor(Date.now()/1000);
const b64=bytes=>btoa(String.fromCharCode(...bytes));
const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function key(env){if(!env.GITHUB_CLIENT_SECRET)fail(503,'Community authorization is not configured.');return crypto.subtle.importKey('raw',await crypto.subtle.digest('SHA-256',new TextEncoder().encode('feh-community-token-v1:'+env.GITHUB_CLIENT_SECRET)),{name:'AES-GCM'},false,['encrypt','decrypt']);}
export async function protect(env,token,githubId){const iv=crypto.getRandomValues(new Uint8Array(12)),data=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode(githubId)},await key(env),new TextEncoder().encode(token));return b64(iv)+'.'+b64(new Uint8Array(data));}
async function reveal(env,row){try{const [iv,data]=row.encrypted_token.split('.');return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(iv),additionalData:new TextEncoder().encode(row.github_id)},await key(env),unb64(data)));}catch{fail(401,'Enable community posting again to reconnect GitHub.');}}
async function graphql(token,query,variables={}){
 const r=await fetch('https://api.github.com/graphql',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json','User-Agent':'FEH-Rerun-Community'},body:JSON.stringify({query,variables}),signal:AbortSignal.timeout(15000)}),data=await r.json();
 if(r.status===401)fail(401,'GitHub authorization expired. Enable community posting again.');
 if(r.status===429||r.status===403&&r.headers.get('x-ratelimit-remaining')==='0')fail(429,'GitHub is busy. Please try again shortly.');
 if(!r.ok||data.errors?.length){if(data.errors?.some(e=>e.type==='NOT_FOUND'))fail(404,'This community post or reply was not found.');const forbidden=data.errors?.some(e=>['FORBIDDEN','INSUFFICIENT_SCOPES'].includes(e.type));fail(forbidden?403:502,forbidden?'GitHub does not allow this action for your account. Check your community authorization and repository permissions.':'GitHub could not complete this request. Reload and try again.');}
 return data.data;
}
async function jsonBody(r){if(Number(r.headers.get('Content-Length')||0)>70000)fail(413,'The post is too large.');const text=await r.text();if(text.length>70000)fail(413,'The post is too large.');try{return JSON.parse(text);}catch{fail(400,'Invalid request.');}}
export function extractFlair(body){const match=body.match(/^<!-- feh-flair: ([a-z-]+) -->\s*/),flair=flairs.find(f=>f.id===match?.[1]);let content=match?body.slice(match[0].length):body;if(flair&&content.startsWith('**Flair: '+flair.name+'**'))content=content.slice(('**Flair: '+flair.name+'**').length).trimStart();return {flair:flair?.id||null,body:content};}
export function validatePost(b){const title=String(b.title||'').trim(),raw=String(b.body||'').trim(),body=extractFlair(raw).body;if(title.length<3||title.length>200||body.length<1||body.length>20000)fail(400,'Use a title of 3–200 characters and a post of 1–20,000 characters.');const flair=flairs.find(f=>f.id===b.flair);if(b.flair&&!flair)fail(400,'Choose a supported community flair.');return {title,body:flair?'<!-- feh-flair: '+flair.id+' -->\n\n**Flair: '+flair.name+'**\n\n'+body:body};}
function requireUser(u){if(!u?.website_account||!u.can_vote||!u.website_id)fail(401,'Sign in to a registered website account with GitHub connected.');}
async function connectedToken(env,u){requireUser(u);const row=await one(env,'SELECT * FROM community_connections WHERE github_id=? AND website_id=?',u.github_id,u.website_id);if(!row)fail(401,'Enable community posting to authorize GitHub Discussions.');u.login=row.login;return reveal(env,row);}
async function readToken(env,u){if(u?.can_vote){const row=await one(env,'SELECT * FROM community_connections WHERE github_id=? AND website_id=?',u.github_id,u.website_id);if(row)return {token:await reveal(env,row),viewer:true};}const reader=await one(env,'SELECT * FROM community_connections WHERE public_reads=1 LIMIT 1');return reader?{token:await reveal(env,reader),viewer:false}:null;}
export function imageType(bytes){if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'image/jpeg';if(bytes.slice(0,8).join(',')==='137,80,78,71,13,10,26,10')return 'image/png';if(new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP')return 'image/webp';return null;}
async function discussion(token,number,extra=''){const d=await graphql(token,`query($number:Int!){repository(owner:"clustifle",name:"FEH-Rerun-Schedule-by-Clustifle"){discussion(number:$number){${postFields} ${extra}}}}`,{number});if(!d.repository?.discussion)fail(404,'This community post was not found.');return d.repository.discussion;}
export async function handleCommunity(request,env,{user,rate,headers}){
 const url=new URL(request.url),path=url.pathname.slice('/community'.length),method=request.method;
 const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
 try{
  // Images are public media, never HTML or executable SVG; allow only immutable random IDs.
  const image=path.match(/^\/images\/([a-f0-9-]{36})$/);
  if(image&&method==='GET'){const row=await one(env,'SELECT bytes,content_type FROM community_images WHERE id=?',image[1]);if(!row)fail(404,'Image not found.');return new Response(row.bytes,{headers:{...headers,'Content-Type':row.content_type,'Content-Security-Policy':"default-src 'none'",'Cache-Control':'public, max-age=31536000, immutable'}});}
  const u=await user(request,env);
  if(path==='/session'&&method==='GET'){const connected=u?.website_id?await one(env,'SELECT login FROM community_connections WHERE github_id=? AND website_id=?',u.github_id,u.website_id):null;if(connected)u.login=connected.login;const reader=await one(env,'SELECT github_id FROM community_connections WHERE public_reads=1 LIMIT 1');return json({user:u,connected:!!connected,publicReady:!!reader});}
  if(path==='/connect'&&method==='POST'){
   requireUser(u);await rate(env,'community-connect:'+u.github_id,6);const b=await jsonBody(request),token=b.token;
   const profileResponse=await fetch(env.SUPABASE_URL+'/rest/v1/tracker_profiles?select=username&id=eq.'+encodeURIComponent(u.website_id),{headers:{apikey:env.SUPABASE_PUBLISHABLE_KEY,Authorization:request.headers.get('Authorization')},signal:AbortSignal.timeout(10000)});
   const profiles=profileResponse.ok?await profileResponse.json():[];if(!profiles[0]?.username)fail(403,'Set your website username before enabling community posting.');
   if(typeof token!=='string'||token.length<20||token.length>512)fail(400,'No GitHub provider token was returned. Please authorize again.');
   const r=await fetch('https://api.github.com/user',{headers:{Authorization:'Bearer '+token,'User-Agent':'FEH-Rerun-Community',Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(10000)}),account=await r.json();
   if(!r.ok||String(account.id)!==u.github_id)fail(403,'Authorize the same GitHub account linked to your website account.');
   const scopes=(r.headers.get('x-oauth-scopes')||'').split(',').map(s=>s.trim());if(!scopes.some(s=>s==='public_repo'||s==='repo'))fail(403,'Community posting needs GitHub public_repo permission.');
   if(b.publicReads&&(u.role!=='owner'||u.github_id!==env.HEAD_ADMIN_GITHUB_ID))fail(403,'Only Head Admin can configure public community reads.');
   const repositoryCheck=await graphql(token,'{viewer{login} repository(owner:"clustifle",name:"FEH-Rerun-Schedule-by-Clustifle"){id isPrivate hasDiscussionsEnabled}}');if(repositoryCheck.repository?.isPrivate||!repositoryCheck.repository?.hasDiscussionsEnabled)fail(403,'Community requires an enabled public GitHub Discussions repository.');
   const encrypted=await protect(env,token,u.github_id);
   await statement(env,'INSERT INTO community_connections(github_id,website_id,login,encrypted_token,public_reads,created_at) VALUES(?,?,?,?,?,?) ON CONFLICT(github_id) DO UPDATE SET website_id=excluded.website_id,login=excluded.login,encrypted_token=excluded.encrypted_token,public_reads=MAX(community_connections.public_reads,excluded.public_reads),created_at=excluded.created_at',u.github_id,u.website_id,account.login,encrypted,b.publicReads?1:0,new Date().toISOString()).run();return json({ok:true});
  }
  if(path==='/disconnect'&&method==='POST'){requireUser(u);await statement(env,'DELETE FROM community_connections WHERE github_id=? AND website_id=?',u.github_id,u.website_id).run();return json({ok:true});}
  if(path==='/images'&&method==='POST'){
   await connectedToken(env,u);await rate(env,'community-images:'+u.github_id,5);
   if(Number(request.headers.get('Content-Length')||0)>524288)fail(413,'Choose an image under 512 KB after optimization.');
   const bytes=new Uint8Array(await request.arrayBuffer());if(!bytes.length||bytes.length>524288)fail(413,'Choose an image under 512 KB after optimization.');const type=imageType(bytes);if(!type||request.headers.get('Content-Type')!==type)fail(400,'Use a PNG, JPEG, or WebP image.');
   const id=crypto.randomUUID();
   // Atomic quota check prevents concurrent uploads bypassing storage limits.
   const result=await statement(env,"INSERT INTO community_images(id,github_id,content_type,bytes,size,created_at) SELECT ?,?,?,?,?,? WHERE (SELECT COALESCE(SUM(size),0) FROM community_images)<209190912 AND (SELECT COUNT(*) FROM community_images WHERE github_id=? AND datetime(created_at)>datetime('now','-1 day'))<50",id,u.github_id,type,bytes.buffer,bytes.length,new Date().toISOString(),u.github_id).run();if(!result.meta.changes)fail(429,'Community image storage is full or your daily upload limit was reached. You can insert an image URL instead.');return json({url:url.origin+'/community/images/'+id});
  }
  const numberMatch=path.match(/^\/posts\/(\d+)(?:\/(comments|replies|upvote|close|answer|delete|delete-comment))?$/),number=numberMatch?Number(numberMatch[1]):null,action=numberMatch?.[2];
  if(method==='GET'&&(path==='/posts'||path==='/categories'||numberMatch&&(!action||action==='replies'))){
   const cacheKey=url.pathname+url.search;
   const cached=await one(env,'SELECT payload,expires_at FROM community_cache WHERE key=?',cacheKey);
   if(!u&&cached&&cached.expires_at>time())return json(JSON.parse(cached.payload));
   await rate(env,'community-read:'+(u?.github_id||request.headers.get('CF-Connecting-IP')||'anonymous'),40);
   const access=await readToken(env,u),token=access?.token;
   if(!token)return json(path==='/categories'?{categories:[],setupRequired:true}:{posts:[],pageInfo:{hasNextPage:false},setupRequired:true});
   const repoStatus=await graphql(token,'{repository(owner:"clustifle",name:"FEH-Rerun-Schedule-by-Clustifle"){isPrivate hasDiscussionsEnabled}}');if(repoStatus.repository?.isPrivate||!repoStatus.repository?.hasDiscussionsEnabled)fail(403,'Community Discussions are not publicly available.');
   let data;
   if(path==='/categories'){const d=await graphql(token,'{repository(owner:"clustifle",name:"FEH-Rerun-Schedule-by-Clustifle"){discussionCategories(first:25){nodes{id name slug isAnswerable}}}}');data={categories:d.repository.discussionCategories.nodes};}
   else if(number&&action==='replies'){const commentId=url.searchParams.get('commentId'),after=url.searchParams.get('after');if(!commentId||commentId.length>200||(after?.length||0)>200)fail(400,'Invalid reply cursor.');const post=await discussion(token,number);const d=await graphql(token,`query($id:ID!,$after:String){node(id:$id){...on DiscussionComment{id discussion{id} replies(first:20,after:$after){totalCount pageInfo{endCursor hasNextPage} nodes{${commentFields}}}}}}`,{id:commentId,after:after||null});if(d.node?.discussion?.id!==post.id)fail(404,'This comment was not found in the discussion.');data={commentId,replies:d.node.replies};}
   else if(number){const after=url.searchParams.get('after');if(after&&after.length>200)fail(400,'Invalid comment cursor.');const post=await discussion(token,number,`comments(first:20${after?',after:'+JSON.stringify(after):''}){totalCount pageInfo{endCursor hasNextPage} nodes{${commentFields} replies(first:10){totalCount pageInfo{endCursor hasNextPage} nodes{${commentFields}}}}}`);data={post};}
   else{
    const after=url.searchParams.get('after'),category=url.searchParams.get('category'),sort=url.searchParams.get('sort'),flair=url.searchParams.get('flair'),q=(url.searchParams.get('q')||'').trim();if((after?.length||0)>200||q.length>100||(category?.length||0)>100||flair&&!flairs.some(f=>f.id===flair))fail(400,'Invalid filter.');
    if(q||flair||sort==='popular'){const escaped=q.replace(/["\\]/g,' ').replace(/\b(?:repo|org|user|author|category|is|type):\S*/gi,'');const d=await graphql(token,`query($q:String!,$after:String){search(query:$q,type:DISCUSSION,first:20,after:$after){pageInfo{endCursor hasNextPage} nodes{...on Discussion{${postFields} repository{nameWithOwner}}}}}`,{q:`repo:${REPO} ${escaped} ${flair?'"feh-flair: '+flair+'" in:body ':''}${sort==='popular'?'sort:reactions':sort==='newest'?'sort:created':'sort:updated'}`,after:after||null});data={posts:d.search.nodes.filter(p=>p.repository?.nameWithOwner===REPO&&(!category||p.category.id===category)&&(!flair||extractFlair(p.body).flair===flair)),pageInfo:d.search.pageInfo};}
    else{const d=await graphql(token,`query($after:String,$category:ID){repository(owner:"clustifle",name:"FEH-Rerun-Schedule-by-Clustifle"){discussions(first:20,after:$after,categoryId:$category,orderBy:{field:${sort==='newest'?'CREATED_AT':'UPDATED_AT'},direction:DESC}){pageInfo{endCursor hasNextPage} nodes{${postFields}}}}}`,{after:after||null,category:category||null});data={posts:d.repository.discussions.nodes,pageInfo:d.repository.discussions.pageInfo};}
   }
   // Public cache omits viewer permissions and never caches authenticated responses.
   for(const p of data.posts||[data.post].filter(Boolean)){const parsed=extractFlair(p.body);p.flair=parsed.flair;p.body=parsed.body;}
   const hideComments=v=>{if(!v||typeof v!=='object')return;if(v.isMinimized)v.body='This comment was hidden by the GitHub moderators.';for(const child of Object.values(v))if(Array.isArray(child))child.forEach(hideComments);else hideComments(child);};hideComments(data);
   if(!access.viewer)data=JSON.parse(JSON.stringify(data,(k,v)=>k.startsWith('viewer')?false:v));
   if(!u){const payload=JSON.stringify(data);if(payload.length<150000)await statement(env,'INSERT INTO community_cache SELECT ?,?,? WHERE (SELECT COUNT(*) FROM community_cache)<500 OR EXISTS(SELECT 1 FROM community_cache WHERE key=?) ON CONFLICT(key) DO UPDATE SET payload=excluded.payload,expires_at=excluded.expires_at',cacheKey,payload,time()+60,cacheKey).run();}
   return json(data);
  }
  if(!['POST','PATCH'].includes(method))fail(405,'Method not allowed.');
  const token=await connectedToken(env,u);await rate(env,'community-write:'+u.github_id,10);const b=await jsonBody(request);
  if(path==='/posts'&&method==='POST'){const input=validatePost(b);if(typeof b.categoryId!=='string')fail(400,'Choose a category.');const categories=await graphql(token,'{repository(owner:"clustifle",name:"FEH-Rerun-Schedule-by-Clustifle"){discussionCategories(first:25){nodes{id slug}}}}');const c=categories.repository.discussionCategories.nodes.find(c=>c.id===b.categoryId);if(!c)fail(400,'Choose a valid community category.');if(c.slug==='announcements'&&!['owner','manager'].includes(u.role))fail(403,'Announcements are reserved for staff.');const d=await graphql(token,'mutation($input:CreateDiscussionInput!){createDiscussion(input:$input){discussion{number url}}}',{input:{repositoryId:REPO_ID,categoryId:c.id,...input}});await statement(env,'DELETE FROM community_cache').run();return json(d.createDiscussion);}
  if(!numberMatch||!Number.isSafeInteger(number)||number<1)fail(404,'Not found.');
  const post=await discussion(token,number);
  let result;
  if(!action&&method==='PATCH'){if(!post.viewerCanUpdate||post.author?.login!==u.login)fail(403,'Only the author can edit this post here.');result=await graphql(token,'mutation($input:UpdateDiscussionInput!){updateDiscussion(input:$input){discussion{number}}}',{input:{discussionId:post.id,...validatePost(b)}});}
  else if(action==='delete'&&method==='POST'){if(!post.viewerCanDelete||post.author?.login!==u.login)fail(403,'Only the author can delete this post here.');result=await graphql(token,'mutation($id:ID!){deleteDiscussion(input:{id:$id}){clientMutationId}}',{id:post.id});}
  else if(action==='delete-comment'||action==='comments'&&method==='PATCH'){
   if(typeof b.commentId!=='string')fail(400,'Choose a comment.');const d=await graphql(token,'query($id:ID!){node(id:$id){...on DiscussionComment{id discussion{id} viewerCanUpdate viewerCanDelete author{login}}}}',{id:b.commentId});const c=d.node;if(c?.discussion?.id!==post.id)fail(404,'This comment was not found in the discussion.');if(c.author?.login!==u.login||!(action==='delete-comment'?c.viewerCanDelete:c.viewerCanUpdate))fail(403,'Only the author can change this reply here.');
   if(action==='delete-comment')result=await graphql(token,'mutation($id:ID!){deleteDiscussionComment(input:{id:$id}){clientMutationId}}',{id:c.id});else{const body=String(b.body||'').trim();if(!body||body.length>20000)fail(400,'Use a reply of 1–20,000 characters.');result=await graphql(token,'mutation($input:UpdateDiscussionCommentInput!){updateDiscussionComment(input:$input){comment{id}}}',{input:{commentId:c.id,body}});}
  }
  else if(action==='comments'&&method==='POST'){
   const body=String(b.body||'').trim();if(!body||body.length>20000)fail(400,'Use a reply of 1–20,000 characters.');if(post.closed||post.locked)fail(403,'This discussion is closed or locked.');
   if(b.replyToId){const d=await graphql(token,'query($id:ID!){node(id:$id){...on DiscussionComment{id discussion{id} replyTo{id}}}}',{id:b.replyToId});if(d.node?.discussion?.id!==post.id||d.node.replyTo)fail(400,'Reply to a top-level comment in this discussion.');}
   result=await graphql(token,'mutation($input:AddDiscussionCommentInput!){addDiscussionComment(input:$input){comment{id}}}',{input:{discussionId:post.id,body,...(b.replyToId?{replyToId:b.replyToId}:{})}});
  }else if(action==='upvote'&&method==='POST'){const mutation=b.remove?'removeUpvote':'addUpvote';result=await graphql(token,`mutation($id:ID!){${mutation}(input:{subjectId:$id}){subject{upvoteCount}}}`,{id:post.id});}
  else if(action==='close'&&method==='POST'){if(!['owner','manager'].includes(u.role))fail(403,'Community moderation requires a staff role.');const mutation=b.reopen?'reopenDiscussion':'closeDiscussion';result=await graphql(token,`mutation($id:ID!){${mutation}(input:{discussionId:$id}){discussion{closed}}}`,{id:post.id});}
  else if(action==='answer'&&method==='POST'){if(post.author?.login!==u.login&&!['owner','manager'].includes(u.role))fail(403,'Only the author or staff can mark an answer.');const d=await graphql(token,'query($id:ID!){node(id:$id){...on DiscussionComment{id discussion{id}}}}',{id:b.commentId});if(d.node?.discussion?.id!==post.id)fail(400,'Choose an answer from this discussion.');result=await graphql(token,'mutation($id:ID!){markDiscussionCommentAsAnswer(input:{id:$id}){discussion{number}}}',{id:b.commentId});}
  else fail(405,'Method not allowed.');
  await statement(env,'DELETE FROM community_cache').run();return json({ok:true,result});
 }catch(e){return json({error:e instanceof CommunityError?e.message:'Community is temporarily unavailable. Please try again.'},e instanceof CommunityError?e.status:503);}
}
