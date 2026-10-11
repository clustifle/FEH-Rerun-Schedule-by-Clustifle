import {useMemo} from 'react';
import {marked} from 'marked';
import DOMPurify from 'dompurify';
export function renderCommunityMarkdown(body:string){
 const safe=DOMPurify.sanitize(marked.parse(body,{gfm:true,breaks:false,async:false}),{ALLOWED_TAGS:['p','br','strong','em','del','blockquote','ul','ol','li','h1','h2','h3','h4','h5','h6','pre','code','a','img','table','thead','tbody','tr','th','td','hr','details','summary','input','video'],ALLOWED_ATTR:['href','src','alt','title','type','checked','disabled','start','controls','playsinline','preload'],ALLOW_DATA_ATTR:false});
 const template=document.createElement('template');template.innerHTML=safe;
 for(const a of template.content.querySelectorAll('a')){const href=a.getAttribute('href')||'';try{const url=new URL(href,location.origin);if(!['https:','http:','mailto:'].includes(url.protocol))throw Error();a.href=url.href;a.target='_blank';a.rel='noopener noreferrer nofollow';}catch{a.removeAttribute('href');}}
 for(const img of template.content.querySelectorAll('img')){try{const url=new URL(img.getAttribute('src')||'');if(url.protocol!=='https:')throw Error();if(url.origin==='https://feh-community-polls.shyguyvn.workers.dev'&&url.pathname.startsWith('/community/images/'))url.searchParams.set('media','2');img.src=url.href;img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';}catch{img.remove();}}
 for(const video of template.content.querySelectorAll('video')){try{const url=new URL(video.getAttribute('src')||'');if(url.protocol!=='https:')throw Error();video.src=url.href;video.controls=true;video.playsInline=true;video.preload='metadata';video.removeAttribute('autoplay');const fallback=video.nextElementSibling;if(fallback?.tagName==='P'&&fallback.textContent==='Watch video'&&fallback.querySelector('a')?.getAttribute('href')===url.href)fallback.remove();}catch{video.remove();}}
 for(const input of template.content.querySelectorAll('input')){if(input.type!=='checkbox')input.remove();else input.disabled=true;}
 return template.innerHTML;
}
export default function CommunityMarkdown({body}:{body:string}){const html=useMemo(()=>renderCommunityMarkdown(body),[body]);return <div className="community-markdown" dangerouslySetInnerHTML={{__html:html}}/>;}
