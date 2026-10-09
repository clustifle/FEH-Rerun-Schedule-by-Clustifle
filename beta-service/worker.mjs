import {handleData} from './data.mjs';
const cookieName='__Host-feh_beta';
const headers={'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow, noarchive','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'};
export const reply=(body,status=200,extra={})=>new Response(body,{status,headers:{...headers,...extra}});
export const json=(value,status=200,extra={})=>reply(JSON.stringify(value),status,{'Content-Type':'application/json',...extra});
const tokenFrom=request=>request.headers.get('Authorization')?.match(/^Bearer ([A-Za-z0-9_.-]+)$/)?.[1]||request.headers.get('Cookie')?.split(';').map(v=>v.trim()).find(v=>v.startsWith(cookieName+'='))?.slice(cookieName.length+1);
export async function verifyOwner(token,env,fetcher=fetch){
 if(!token||token.length>8192||!/^[-\w]+\.[-\w]+\.[-\w]+$/.test(token))return null;
 const h={apikey:env.SUPABASE_PUBLISHABLE_KEY,Authorization:'Bearer '+token};
 const user=await fetcher(env.SUPABASE_URL+'/auth/v1/user',{headers:h,signal:AbortSignal.timeout(10000)});
 if(!user.ok)return null;const account=await user.json();if(!account.id||account.is_anonymous)return null;
 const role=await fetcher(env.SUPABASE_URL+'/rest/v1/rpc/tracker_role',{method:'POST',headers:{...h,'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(10000)});
 if(!role.ok||await role.json()!=='Owner')return null;
 return account.id;
}
const loginHtml=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>FEH Rerun Schedule — Beta</title><style>@font-face{font-family:FEH;src:url('/_beta/font.woff2')}*{box-sizing:border-box}body{margin:0;background:#082e3b;color:#fff5da;font-family:FEH,serif;min-height:100vh;display:grid;place-items:center;padding:24px}main{width:min(560px,100%);text-align:center}img{width:100%;height:auto}h1{font-size:28px}p{line-height:1.6}button,a{font:inherit}button{padding:12px 24px;border:1px solid #dbcf99;border-radius:8px;background:#174b59;color:inherit;cursor:pointer}button:disabled{opacity:.6}a{color:#ffde86}#status{min-height:48px}</style></head><body><main><img src="/_beta/logo.png" alt="FEH Rerun Schedule by Clustifle Beta"><h1>Version 2.0 Beta</h1><p>Private testing for Head Admin.</p><p id="status" role="status">Checking access…</p><button id="signin" hidden>Continue with GitHub</button><p><a href="https://clustifle.github.io/FEH-Rerun-Schedule-by-Clustifle/">Open the public website</a></p></main><script src="/_beta/login.js" defer></script></body></html>`;
const adminLoginHtml=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Administrative Manager — Sign in</title><style>*{box-sizing:border-box}body{margin:0;background:#f4f4f4;color:#333;font-family:"Segoe UI",Arial,sans-serif}header{padding:24px;background:#3c3c3c;color:#fff;font-size:23px;font-weight:300}main{width:min(520px,calc(100% - 32px));margin:12vh auto;background:#fff;border:1px solid #bbb;padding:32px}h1{font-size:25px;font-weight:300}p{line-height:1.6}button,a{font:inherit}button{padding:10px 18px;background:#0078d4;color:#fff;border:0;cursor:pointer}button:disabled{opacity:.5}a{color:#006ab7}#status{min-height:48px}</style></head><body><header>FEHRS Administrative Manager</header><main><h1>Private beta workspace</h1><p>Sign in with your existing Head Admin account to manage test records.</p><p id="status" role="status">Checking access…</p><button id="signin" hidden>Continue with GitHub</button><p><a href="/home">Open FEH Rerun Schedule</a></p></main><script>try{sessionStorage.setItem('feh-beta-return','/FEHRS_AdmManager/');}catch{}</script><script src="/_beta/login.js" defer></script></body></html>`;
export function createWorker(fetcher=fetch){const verifiedReads=new Map();return {async fetch(request,env){
 try{
  const url=new URL(request.url),path=url.pathname;
  if(path==='/robots.txt')return reply('User-agent: *\nDisallow: /\n',200,{'Content-Type':'text/plain'});
  const publicAssets={'/_beta/login.js':'/_beta/login.js','/_beta/logo.png':'/clustifle-feh-rerun-beta-logo.png','/_beta/font.woff2':'/themes/fire-emblem-heroes/feh.woff2'};
  if(request.method==='GET'&&Object.hasOwn(publicAssets,path)){const target=new URL(publicAssets[path],url);const asset=await env.ASSETS.fetch(new Request(target));return reply(asset.body,asset.status,Object.fromEntries(asset.headers));}
  if(path==='/_beta/session'&&request.method==='DELETE'){
   if(request.headers.get('Origin')!==url.origin)return json({error:'Invalid origin'},403);
   return json({ok:true},200,{'Set-Cookie':cookieName+'=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'});
  }
  const token=tokenFrom(request);let owner=null;
  // Only previously verified, unexpired tokens can reuse a short read-only check.
  const cached=token&&verifiedReads.get(token);
  if(request.method==='GET'&&cached&&cached.until>Date.now())owner=cached.owner;
  else{owner=await verifyOwner(token,env,fetcher);if(owner){let expires=0;try{expires=JSON.parse(atob(token.split('.')[1].replaceAll('-','+').replaceAll('_','/'))).exp*1000;}catch{}
   if(verifiedReads.size>=128)verifiedReads.clear();if(expires>Date.now())verifiedReads.set(token,{owner,until:Math.min(expires,Date.now()+60000)});
  }}
  if(path==='/_beta/session'){
   if(request.method!=='POST'||request.headers.get('Origin')!==url.origin)return json({error:'Invalid request'},403);
   if(!owner)return json({error:'Only Head Admin can access this beta.'},403);
   return json({ok:true},200,{'Set-Cookie':cookieName+'='+token+'; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=900'});
  }
  if(!owner){if(request.method==='GET'&&(request.headers.get('Accept')||'').includes('text/html'))return reply(path==='/FEHRS_AdmManager'||path.startsWith('/FEHRS_AdmManager/')?adminLoginHtml:loginHtml,200,{'Content-Type':'text/html;charset=utf-8'});return json({error:'Head Admin beta access required.'},403);}
  if(path.startsWith('/_beta/api/')){
   if(!['GET','HEAD'].includes(request.method)&&request.headers.get('Origin')!==url.origin)return json({error:'Invalid origin'},403);
   return await handleData(request,env,owner);
  }
  if(!['GET','HEAD'].includes(request.method))return json({error:'Method not allowed'},405);
  if(path==='/sw.js')return reply('/* Service workers disabled for private beta. */',404,{'Content-Type':'text/javascript'});
  // Asset serving redirects index.html to its folder URL. Fetch that canonical
  // folder directly so administrative deep links never repeat the redirect.
  const assetRequest=path==='/FEHRS_AdmManager'||path.startsWith('/FEHRS_AdmManager/')?new Request(new URL('/FEHRS_AdmManager/',url),request):request;
  const asset=await env.ASSETS.fetch(assetRequest),h=new Headers(asset.headers);for(const [k,v] of Object.entries(headers))h.set(k,v);
  return new Response(asset.body,{status:asset.status,headers:h});
 }catch{return json({error:'Could not verify beta access. Please try again.'},503);}
}};}
export default createWorker();
