const now=()=>new Date().toISOString();
const epoch=()=>Math.floor(Date.now()/1000);
const random=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
export const hash=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('');
class HttpError extends Error{constructor(status,message){super(message);this.status=status;}}
const fail=(status,message)=>{throw new HttpError(status,message);};
const stmt=(env,sql,...args)=>env.DB.prepare(sql).bind(...args);
const all=async(env,sql,...args)=>(await stmt(env,sql,...args).all()).results;
const one=(env,sql,...args)=>stmt(env,sql,...args).first();
const active=p=>p.status==='open'&&(!p.closes_at||p.closes_at>now());
const staff=u=>u&&['owner','manager'].includes(u.role);
async function user(request,env){
 const bearer=request.headers.get('Authorization')?.match(/^Bearer (.+)$/)?.[1];if(!bearer)return null;
 if(env.SUPABASE_URL){
  if(!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(bearer))return null;
  const headers={apikey:env.SUPABASE_PUBLISHABLE_KEY,Authorization:'Bearer '+bearer};
  const response=await fetch(env.SUPABASE_URL+'/auth/v1/user',{headers,signal:AbortSignal.timeout(10000)});if(!response.ok)return null;
  const account=await response.json();if(!account.id||account.is_anonymous)return null;
  const roleResponse=await fetch(env.SUPABASE_URL+'/rest/v1/rpc/tracker_role',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(10000)});
  if(!roleResponse.ok)fail(503,'Could not verify website permissions. Please try again.');
  const role=await roleResponse.json(),identity=account.identities?.find(i=>i.provider==='github'),githubId=identity?.identity_data?.provider_id||identity?.identity_data?.sub;
  const github=githubId&&/^\d{1,20}$/.test(String(githubId))?String(githubId):null;
  return {github_id:github||'site:'+account.id,login:identity?.identity_data?.user_name||'Website account',role:role==='Owner'?'owner':role==='Manager'?'manager':'voter',can_vote:!!github,website_account:true};
 }
 const token=bearer.match(/^[a-f0-9]{64}$/)?.[0];if(!token)return null;const u=await one(env,'SELECT github_id,login FROM poll_sessions WHERE token_hash=? AND expires_at>?',await hash(token),epoch());if(!u)return null;u.role=u.github_id===env.HEAD_ADMIN_GITHUB_ID?'owner':await one(env,'SELECT github_id FROM poll_staff WHERE github_id=?',u.github_id)?'manager':'voter';return u;
}
const requireStaff=u=>{if(!staff(u))fail(403,'Poll staff access is required.');};
async function body(request){if(Number(request.headers.get('Content-Length')||0)>12000)fail(413,'The request is too large.');const text=await request.text();if(text.length>12000)fail(413,'The request is too large.');try{return JSON.parse(text);}catch{fail(400,'Invalid request.');}}
async function rate(env,key,limit){const minute=Math.floor(epoch()/60),id=key+':'+minute;const r=await one(env,'INSERT INTO poll_rate_limits(key,count,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count',id,epoch()+120);if(r.count>limit)fail(429,'Please wait a minute before trying again.');}
function validate(b){const question=String(b.question||'').trim(),description=String(b.description||'').trim(),choices=Array.isArray(b.choices)?b.choices.map(c=>String(c).trim()):[];if(question.length<5||question.length>240||description.length>2000)fail(400,'Use a question of 5–240 characters and a description under 2,000 characters.');if(choices.length<2||choices.length>8||choices.some(c=>!c||c.length>120)||new Set(choices.map(c=>c.toLowerCase())).size!==choices.length)fail(400,'Add 2–8 different choices, each under 120 characters.');if(!['public','after_vote','closed'].includes(b.results_mode))fail(400,'Choose when results become visible.');let closes=null;if(b.closes_at){const d=new Date(b.closes_at);if(!Number.isFinite(d.valueOf())||d<=new Date())fail(400,'Choose a future closing date.');closes=d.toISOString();}return {question,description,choices,featured:b.featured?1:0,allow_change:b.allow_change?1:0,results_mode:b.results_mode,closes_at:closes};}
const audit=(env,u,action,id,label)=>stmt(env,'INSERT INTO poll_history(github_id,login,action,poll_id,label,created_at) VALUES(?,?,?,?,?,?)',u.github_id,u.login,action,id,label,now());
async function writePoll(env,p,changes){const ticket=crypto.randomUUID();try{return await env.DB.batch([stmt(env,'INSERT INTO poll_write_guard VALUES(?,(SELECT COUNT(*) FROM polls WHERE id=? AND revision=?))',ticket,p.id,p.revision),...changes,stmt(env,'DELETE FROM poll_write_guard WHERE ticket=?',ticket)]);}catch(e){if(String(e).includes('CHECK constraint failed'))fail(409,'This poll changed. Reload it before saving.');throw e;}}
async function detail(env,p,u){const my=u?await one(env,'SELECT choice_id FROM poll_votes WHERE poll_id=? AND github_id=?',p.id,u.github_id):null;const visible=staff(u)||p.results_mode==='public'||(p.results_mode==='after_vote'&&!!my)||(!active(p)&&p.status!=='draft');const choices=await all(env,'SELECT id,label,position FROM poll_choices WHERE poll_id=? ORDER BY position',p.id);let total=null;if(visible){const counts=await all(env,'SELECT choice_id,COUNT(*) AS votes FROM poll_votes WHERE poll_id=? GROUP BY choice_id',p.id);total=counts.reduce((sum,c)=>sum+c.votes,0);for(const c of choices)c.votes=counts.find(r=>r.choice_id===c.id)?.votes||0;}return {...p,status:p.status==='open'&&!active(p)?'closed':p.status,choices,total,my_choice:my?.choice_id||null,can_vote:!!u&&u.can_vote!==false&&active(p)&&(!my||!!p.allow_change)};}
function redirect(url,cookie){return new Response(null,{status:302,headers:{Location:url,'Cache-Control':'no-store','Referrer-Policy':'no-referrer',...(cookie?{'Set-Cookie':cookie}:{})}});}
async function auth(request,env,url){
 if(!env.GITHUB_CLIENT_ID||!env.GITHUB_CLIENT_SECRET)fail(503,'GitHub voting is being connected. Please check back soon.');
 if(url.pathname==='/auth/github'){
  if(env.SUPABASE_URL)fail(400,'Sign in through your website account. Separate poll sign-in is no longer needed.');
  const nonce=url.searchParams.get('nonce');if(!nonce||!/^[a-f0-9]{64}$/.test(nonce))fail(400,'Start GitHub sign-in from the community polls page.');
  const site=new URL(env.SITE_URL);if(request.headers.get('Origin')&&request.headers.get('Origin')!==site.origin)fail(403,'Invalid origin.');
  await rate(env,'auth:'+await hash((request.headers.get('CF-Connecting-IP')||'local')+env.GITHUB_CLIENT_SECRET),12);
  const state=random(),verifier=random(),digest=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier)));const challenge=btoa(String.fromCharCode(...digest)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
  const returnPath=url.searchParams.get('manage')==='1'?'mods-tool/polls':'polls';await stmt(env,'INSERT INTO poll_oauth(state,verifier,return_path,expires_at,client_nonce) VALUES(?,?,?,?,?)',state,verifier,returnPath,epoch()+600,nonce).run();
  const login=new URL('https://github.com/login/oauth/authorize');login.search=new URLSearchParams({client_id:env.GITHUB_CLIENT_ID,redirect_uri:url.origin+'/auth/callback',state,code_challenge:challenge,code_challenge_method:'S256',allow_signup:'true'}).toString();
  return redirect(login.href,'poll_oauth='+state+'; HttpOnly; Secure; SameSite=Lax; Path=/auth; Max-Age=600');
 }
 if(url.pathname==='/auth/callback'){
  const state=url.searchParams.get('state'),cookie=request.headers.get('Cookie')?.match(/(?:^|;\s*)poll_oauth=([a-f0-9]{64})(?:;|$)/)?.[1];if(!state||state!==cookie||!url.searchParams.get('code'))fail(400,'GitHub sign-in expired or was cancelled. Please start again.');
  const pending=await one(env,'DELETE FROM poll_oauth WHERE state=? AND expires_at>? RETURNING *',state,epoch());if(!pending)fail(400,'GitHub sign-in expired. Please start again.');
  const response=await fetch('https://github.com/login/oauth/access_token',{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify({client_id:env.GITHUB_CLIENT_ID,client_secret:env.GITHUB_CLIENT_SECRET,code:url.searchParams.get('code'),redirect_uri:url.origin+'/auth/callback',code_verifier:pending.verifier}),signal:AbortSignal.timeout(15000)});const token=await response.json();if(!response.ok||!token.access_token)fail(401,'GitHub sign-in failed. Please try again.');
  const profile=await fetch('https://api.github.com/user',{headers:{Authorization:'Bearer '+token.access_token,Accept:'application/vnd.github+json','User-Agent':'FEH-Community-Polls'},signal:AbortSignal.timeout(15000)});const account=await profile.json();if(!profile.ok||!Number.isSafeInteger(account.id)||!account.login)fail(401,'Could not verify your GitHub account.');
  const session=random();await stmt(env,'INSERT INTO poll_sessions VALUES(?,?,?,?)',await hash(session),String(account.id),account.login,epoch()+86400).run();
  return redirect(env.SITE_URL.replace(/\/?$/,'/')+pending.return_path+'#poll_session='+session+'&poll_nonce='+pending.client_nonce,'poll_oauth=; HttpOnly; Secure; SameSite=Lax; Path=/auth; Max-Age=0');
 }
 fail(404,'Not found.');
}
export async function handle(request,env){
 const url=new URL(request.url),origin=new URL(env.SITE_URL).origin,from=request.headers.get('Origin');
 const headers={'Content-Type':'application/json','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff',Vary:'Origin',...(from===origin?{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'Authorization, Content-Type','Access-Control-Allow-Methods':'GET, POST, PATCH, OPTIONS'}:{})};
 const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
 try{
  if(url.pathname.startsWith('/auth/'))return await auth(request,env,url);
  if(from&&from!==origin)fail(403,'Invalid origin.');if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(!['GET','POST','PATCH'].includes(request.method))fail(405,'Method not allowed.');
  const u=await user(request,env);
  if(url.pathname==='/session'&&request.method==='GET')return json({user:u});
  if(url.pathname==='/logout'&&request.method==='POST'){const token=request.headers.get('Authorization')?.slice(7);if(token)await stmt(env,'DELETE FROM poll_sessions WHERE token_hash=?',await hash(token)).run();return json({ok:true});}
  if(url.pathname==='/history'&&request.method==='GET'){requireStaff(u);return json({history:await all(env,'SELECT login,action,label,created_at FROM poll_history ORDER BY id DESC LIMIT 100')});}
  if(url.pathname==='/staff'){
   if(env.SUPABASE_URL)fail(403,'Manage staff roles through the website Mods Tool.');
   if(u?.role!=='owner')fail(403,'Only Head Admin can manage poll staff.');
   if(request.method==='GET')return json({staff:await all(env,'SELECT github_id,login FROM poll_staff ORDER BY login')});
   const b=await body(request);if(!/^\d{1,20}$/.test(String(b.github_id))||String(b.github_id)===env.HEAD_ADMIN_GITHUB_ID)fail(400,'Head Admin access cannot be changed.');
   if(b.enabled){const r=await fetch('https://api.github.com/user/'+b.github_id,{headers:{Accept:'application/vnd.github+json','User-Agent':'FEH-Community-Polls'},signal:AbortSignal.timeout(10000)}),account=await r.json();if(!r.ok||String(account.id)!==String(b.github_id))fail(400,'That GitHub account could not be verified.');await env.DB.batch([stmt(env,'INSERT INTO poll_staff VALUES(?,?) ON CONFLICT(github_id) DO UPDATE SET login=excluded.login',String(account.id),account.login),audit(env,u,'Grant poll manager',null,account.login)]);}else await env.DB.batch([stmt(env,'DELETE FROM poll_staff WHERE github_id=?',String(b.github_id)),audit(env,u,'Remove poll manager',null,String(b.github_id))]);return json({ok:true});
  }
  if(url.pathname==='/polls'&&request.method==='GET'){
   const admin=url.searchParams.get('admin')==='1';if(admin)requireStaff(u);
   const polls=await all(env,admin?'SELECT p.*,(SELECT COUNT(*) FROM poll_votes v WHERE v.poll_id=p.id) AS total FROM polls p ORDER BY created_at DESC LIMIT 100':"SELECT id,question,description,status,featured,closes_at,created_at,results_mode FROM polls WHERE status IN ('open','closed') ORDER BY created_at DESC LIMIT 50");
   return json({polls:polls.map(p=>({...p,status:p.status==='open'&&!active(p)?'closed':p.status}))});
  }
  if(url.pathname==='/polls'&&request.method==='POST'){
   requireStaff(u);const b=validate(await body(request)),id=crypto.randomUUID(),time=now();
   await env.DB.batch([stmt(env,'INSERT INTO polls(id,question,description,featured,allow_change,results_mode,closes_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)',id,b.question,b.description,b.featured,b.allow_change,b.results_mode,b.closes_at,time,time),...b.choices.map((label,i)=>stmt(env,'INSERT INTO poll_choices VALUES(?,?,?,?)',crypto.randomUUID(),id,label,i)),audit(env,u,'Create draft',id,b.question)]);return json({id},201);
  }
  const match=url.pathname.match(/^\/polls\/([a-f0-9-]{36})(?:\/(vote|state))?$/);if(!match)fail(404,'Not found.');const id=match[1],action=match[2];const p=await one(env,'SELECT * FROM polls WHERE id=?',id);if(!p||(['draft','archived'].includes(p.status)&&!staff(u)))fail(404,'Poll not found.');
  if(!action&&request.method==='GET')return json({poll:await detail(env,p,u)});
  if(action==='vote'&&request.method==='POST'){
   if(!u)fail(401,'Create or sign in to your website account to vote.');if(u.can_vote===false)fail(403,'Connect GitHub to your website account before voting.');await rate(env,'vote:'+u.github_id,30);const b=await body(request);if(!active(p))fail(409,'Voting has closed.');
   const r=await stmt(env,"INSERT INTO poll_votes(poll_id,github_id,choice_id,updated_at) SELECT p.id,?,c.id,? FROM polls p JOIN poll_choices c ON c.poll_id=p.id WHERE p.id=? AND c.id=? AND p.status='open' AND (p.closes_at IS NULL OR p.closes_at>?) ON CONFLICT(poll_id,github_id) DO UPDATE SET choice_id=excluded.choice_id,updated_at=excluded.updated_at WHERE (SELECT allow_change FROM polls WHERE id=excluded.poll_id)=1",u.github_id,now(),id,String(b.choice_id),now()).run();if(!r.meta.changes)fail(409,'Your vote could not be changed. Voting may have closed or your vote is already recorded.');return json({poll:await detail(env,await one(env,'SELECT * FROM polls WHERE id=?',id),u)});
  }
  requireStaff(u);await rate(env,'staff:'+u.github_id,30);const b=await body(request);if(b.revision!==p.revision)fail(409,'This poll changed. Reload it before saving.');
  if(action==='state'&&request.method==='POST'){
   const valid=(p.status==='draft'&&b.status==='open')||(p.status==='open'&&b.status==='closed')||((p.status==='closed'||(p.status==='open'&&!active(p)))&&b.status==='archived');if(!valid)fail(400,'This poll cannot make that change.');if(b.status==='open'&&p.closes_at&&p.closes_at<=now())fail(400,'Update the closing date before publishing.');
   await writePoll(env,p,[stmt(env,'UPDATE polls SET status=?,revision=revision+1,updated_at=? WHERE id=? AND revision=?',b.status,now(),id,p.revision),audit(env,u,b.status==='open'?'Publish poll':b.status==='closed'?'Close poll':'Archive poll',id,p.question)]);return json({ok:true});
  }
  if(!action&&request.method==='PATCH'){
   const v=validate(b);if(p.status!=='draft'){const labels=(await all(env,'SELECT label FROM poll_choices WHERE poll_id=? ORDER BY position',id)).map(c=>c.label);if(v.question!==p.question||JSON.stringify(v.choices)!==JSON.stringify(labels)||v.allow_change!==p.allow_change||v.results_mode!==p.results_mode)fail(400,'Published questions, choices, and voting rules are locked. Create a new poll to change them.');}
   const changes=[stmt(env,'UPDATE polls SET question=?,description=?,featured=?,allow_change=?,results_mode=?,closes_at=?,revision=revision+1,updated_at=? WHERE id=? AND revision=?',v.question,v.description,v.featured,v.allow_change,v.results_mode,v.closes_at,now(),id,p.revision)];
   // Replacement choices are conditional on the successful revision update in this transaction.
   if(p.status==='draft'){changes.push(stmt(env,'DELETE FROM poll_choices WHERE poll_id=? AND EXISTS(SELECT 1 FROM polls WHERE id=? AND revision=? AND status=\'draft\')',id,id,p.revision+1));v.choices.forEach((label,i)=>changes.push(stmt(env,"INSERT INTO poll_choices(id,poll_id,label,position) SELECT ?,?,?,? WHERE EXISTS(SELECT 1 FROM polls WHERE id=? AND revision=? AND status='draft')",crypto.randomUUID(),id,label,i,id,p.revision+1)));}
   changes.push(audit(env,u,'Edit poll',id,p.question));await writePoll(env,p,changes);return json({ok:true});
  }
  fail(405,'Method not allowed.');
 }catch(e){return json({error:e instanceof HttpError?e.message:'The poll service is temporarily unavailable. Please try again.'},e instanceof HttpError?e.status:503);}
}
export default {fetch:handle,async scheduled(_controller,env){await env.DB.batch(['poll_sessions','poll_oauth','poll_rate_limits'].map(table=>stmt(env,'DELETE FROM '+table+' WHERE expires_at<?',epoch())));}};
