import {readBoundedBody} from './request-body.mjs';
export class WikiImportError extends Error{constructor(status,message){super(message);this.status=status;}}
const fail=(status,message)=>{throw new WikiImportError(status,message);};
export function wikiImportPage(value){
 let url,page;try{url=new URL(value);page=decodeURIComponent(url.pathname.slice(6)).replace(/_/g,' ');}catch{fail(400,'Use a valid FEH Wiki hero page URL.');}
 if(typeof value!=='string'||value.length>2000||url.protocol!=='https:'||url.hostname!=='feheroes.fandom.com'||url.username||url.password||url.port||!url.pathname.startsWith('/wiki/')||!page.includes(':')||/^(File|Template|Category|Special|Module|User|Talk):/i.test(page)||page.includes('/')||/[\u0000-\u001f]/.test(page))fail(400,'Use an HTTPS hero page from feheroes.fandom.com.');
 return page;
}
export async function fetchWikiImport(value){
 const page=wikiImportPage(value),endpoint=new URL('https://feheroes.fandom.com/api.php');
 endpoint.search=new URLSearchParams({action:'parse',page,prop:'text',format:'json',formatversion:'2',redirects:'1'}).toString();
 const cache=globalThis.caches?.default,cacheKey=new Request(endpoint.href);
 try{const cached=await cache?.match(cacheKey);if(cached)return await cached.json();}catch{}
 let response;
 try{response=await fetch(endpoint.href,{headers:{Accept:'application/json','User-Agent':'FEH-Rerun-Importer/2.5 (+https://clustifle.github.io/FEH-Rerun-Schedule-by-Clustifle/)'},redirect:'manual',signal:AbortSignal.timeout(15000)});}
 catch{fail(502,'The wiki import service could not reach FEH Wiki. Please retry.');}
 if(response.status===429)fail(503,'FEH Wiki is busy. Please retry shortly.');
 if(!response.ok||!response.headers.get('Content-Type')?.includes('application/json'))fail(502,'FEH Wiki temporarily blocked the import service. Please retry shortly.');
 if(Number(response.headers.get('Content-Length')||0)>4000000)fail(413,'This wiki page is too large.');
 const bytes=await readBoundedBody(response,4000000,()=>fail(413,'This wiki page is too large.'));
 let data;try{data=JSON.parse(new TextDecoder().decode(bytes));}catch{fail(502,'FEH Wiki did not return usable page information.');}
 if(data.error?.code==='missingtitle')fail(404,'Hero page not found.');
 if(data.error||typeof data.parse?.title!=='string'||typeof data.parse?.text!=='string')fail(502,'FEH Wiki did not return usable hero information.');
 if(data.parse.text.length>3000000)fail(413,'This wiki page is too large.');
 const result={parse:{title:data.parse.title,text:data.parse.text}};
 // Cache only public wiki source, never caller credentials or challenge HTML.
 try{await cache?.put(cacheKey,new Response(JSON.stringify(result),{headers:{'Content-Type':'application/json','Cache-Control':'public, max-age=3600'}}));}catch{}
 return result;
}
