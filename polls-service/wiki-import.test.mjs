import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fetchWikiImport,wikiImportPage} from './wiki-import.mjs';
const url='https://feheroes.fandom.com/wiki/Alm%3A_Saint-King';
const payload={parse:{title:'Alm: Saint-King',text:'<table>Hero information</table>'}};
test('wiki proxy accepts only hero pages on the fixed HTTPS wiki host',()=>{
 assert.equal(wikiImportPage(url),'Alm: Saint-King');
 for(const bad of ['https://localhost/wiki/A:_B','https://feheroes.fandom.com.evil.test/wiki/A:_B','http://feheroes.fandom.com/wiki/A:_B','https://user:pass@feheroes.fandom.com/wiki/A:_B','https://feheroes.fandom.com/wiki/File:Image.png','https://feheroes.fandom.com/wiki/A:_B%2FStats','https://feheroes.fandom.com/wiki/A%ZZ:_B',null])assert.throws(()=>wikiImportPage(bad));
});
test('successful public wiki source is bounded, sanitized and cached without user credentials',async()=>{
 const previousFetch=globalThis.fetch,previousCache=globalThis.caches;let calls=0;const entries=new Map();
 globalThis.caches={default:{match:async r=>entries.get(r.url)?.clone(),put:async(r,response)=>{entries.set(r.url,response);}}};
 globalThis.fetch=async(target,options)=>{calls++;assert.equal(new URL(target).hostname,'feheroes.fandom.com');assert.equal(new URL(target).searchParams.get('page'),'Alm: Saint-King');assert.equal(options.headers.Authorization,undefined);assert.equal(options.headers.Cookie,undefined);assert.equal(options.redirect,'manual');return Response.json({...payload,privateField:'discarded'});};
 try{assert.deepEqual(await fetchWikiImport(url),payload);assert.deepEqual(await fetchWikiImport(url),payload);assert.equal(calls,1);assert.equal(entries.values().next().value.headers.get('Cache-Control'),'public, max-age=3600');}
 finally{globalThis.fetch=previousFetch;globalThis.caches=previousCache;}
});
test('verification HTML and upstream failures never become cached previews',async()=>{
 const previousFetch=globalThis.fetch,previousCache=globalThis.caches;let writes=0;
 globalThis.caches={default:{match:async()=>null,put:async()=>writes++}};
 try{
  for(const response of [new Response('<html>Cloudflare CAPTCHA</html>',{status:403}),new Response('<html>Challenge</html>',{headers:{'Content-Type':'text/html'}}),Response.json({error:{code:'missingtitle'}}),Response.json({parse:{title:'Bad',text:123}})]){
   globalThis.fetch=async()=>response;await assert.rejects(fetchWikiImport(url));
  }
  globalThis.fetch=async()=>{throw Error('Network failed');};await assert.rejects(fetchWikiImport(url),/could not reach/);
  globalThis.fetch=async()=>new Response('x'.repeat(4000001),{headers:{'Content-Type':'application/json'}});await assert.rejects(fetchWikiImport(url),/too large/);
  assert.equal(writes,0);
 }finally{globalThis.fetch=previousFetch;globalThis.caches=previousCache;}
});
