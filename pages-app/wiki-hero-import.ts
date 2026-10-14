import {communityApi} from './community-api';
import {skillSlots,type SkillSlot} from './hero-skills';
export type WikiSkill={slot:SkillSlot;name:string;icon:string|null;thumbnail?:string|null;refineIcon?:string|null;refineThumbnail?:string|null};
export type WikiHero={title:string;version:string|null;releaseDate:string|null;skills:WikiSkill[];url:string};
export function wikiPageUrl(value:string){
 let url:URL,page:string;try{url=new URL(value.trim());page=decodeURIComponent(url.pathname.slice(6));if(/%[0-9a-f]{2}/i.test(page))page=decodeURIComponent(page);if(/[\u0000-\u001f\u007f]/u.test(page))throw Error('Invalid page characters');page=page.normalize('NFC').replace(/[\u2018\u2019\u02bc]/g,"'").replace(/[\u2010-\u2015\u2212]/g,'-').replace(/_/g,' ').replace(/\s+/gu,' ').trim();}catch{throw Error('Use a valid FEH Wiki hero page URL.');}
 if(value.length>2000||url.protocol!=='https:'||url.hostname!=='feheroes.fandom.com'||url.username||url.password||url.port||!url.pathname.startsWith('/wiki/'))throw Error('Use an HTTPS hero page from feheroes.fandom.com.');
 if(!page.includes(':')||/^(File|Template|Category|Special|Module|User|Talk):/i.test(page)||page.includes('/')||/[\u0000-\u001f\u007f]/u.test(page))throw Error('Choose a hero page, not an image, category or subpage.');
 return {page,url:'https://feheroes.fandom.com/wiki/'+encodeURIComponent(page.replace(/ /g,'_'))};
}
const text=(el:Element|undefined|null)=>el?.textContent?.normalize('NFC').replace(/\s+/g,' ').trim()||'';
export const wikiHeroName=(name:string)=>name.normalize('NFC').replace(/\s*\((?:M|F|Y|A)\)\s*$/i,'').trim();
const matchKey=(value:string)=>value.normalize('NFKD').toLowerCase().replace(/\p{M}/gu,'').replace(/[ðþæøœłß]/g,letter=>({'ð':'d','þ':'th','æ':'ae','ø':'o','œ':'oe','ł':'l','ß':'ss'}[letter]!)).replace(/\s*\((?:m|f|y|a)\)(?=\s*:|\s*$)/g,'').replace(/[^\p{L}\p{N}]/gu,'');
export const wikiMatch=(a:string,b:string)=>!!matchKey(a)&&matchKey(a)===matchKey(b);
function rows(table:Element){const result:Element[][]=[],carry=new Map<number,{cell:Element;left:number}>();for(const tr of table.querySelectorAll('tr')){if(tr.closest('table')!==table)continue;const out:Element[]=[];for(const [i,c] of carry){out[i]=c.cell;if(--c.left===0)carry.delete(i);}let col=0;for(const cell of tr.children){if(!['TD','TH'].includes(cell.tagName))continue;while(out[col])col++;const colspan=Math.max(1,Number(cell.getAttribute('colspan')||1)),span=Number(cell.getAttribute('rowspan')||1);for(let n=0;n<colspan;n++){out[col+n]=cell;if(span>1)carry.set(col+n,{cell,left:span-1});}col+=colspan;}result.push(out);}return result;}
export function highestWikiPassives(candidates:WikiSkill[]){const best=new Map<SkillSlot,WikiSkill>();const tier=(name:string)=>{const match=name.match(/\s+(\d+)$/);return match?{family:name.slice(0,match.index).normalize('NFKC').toLowerCase(),rank:Number(match[1])}:null;};for(const skill of candidates){if(!['A','B','C','X'].includes(skill.slot))continue;const old=best.get(skill.slot),nextTier=tier(skill.name),oldTier=old&&tier(old.name);if(old&&nextTier&&oldTier&&nextTier.rank<oldTier.rank)continue;
 // Wiki learnsets list upgrades in progression order, including renamed and exclusive finals.
 best.set(skill.slot,skill);
}return [...best.values()];}
export function parseWikiHero(html:string,title:string,url:string):WikiHero{
 const doc=new DOMParser().parseFromString(html,'text/html');
 const metadata=new Map<string,string>();for(const tr of doc.querySelectorAll('tr')){const cells=Array.from(tr.children);const label=text(cells[0]);if(['Version','Release Date'].includes(label)&&cells[1])metadata.set(label,text(cells[1]));}
 const version=metadata.get('Version')?.match(/^\d+\.\d+(?:\.\d+)?$/)?.[0]||null,releaseDate=metadata.get('Release Date')?.match(/^\d{4}-\d{2}-\d{2}$/)?.[0]||null;
 if(!version&&!releaseDate)throw Error('This page does not contain recognizable hero release information.');
 const skills:WikiSkill[]=[];
 const headings=Array.from(doc.querySelectorAll('h2,h3,h4,h5,h6'));
 const heading=(label:string)=>headings.find(h=>[h.id,h.querySelector('[id]')?.id,text(h).replace(/\[.*?\]/g,'')].some(value=>value?.replace(/_/g,' ').trim().toLowerCase()===label.toLowerCase()));
 for(const [section,slot] of [['Weapons','Weapon'],['Assists','Assist'],['Specials','Special'],['Passives','Passive']]){
  // Story enemies can have a different weapon: always prefer the playable unit's table.
  const start=section==='Weapons'?(heading('Ally Weapons')||heading(section)):heading(section);
  let node=start?.nextElementSibling;let table:Element|undefined;
  while(node&&!/^H[2-6]$/.test(node.tagName)){if(node.tagName==='TABLE'){table=node;break;}const nested=node.querySelector('table');if(nested){table=nested;break;}node=node.nextElementSibling;}
  if(!table)continue;const grid=rows(table),headerRow=grid.findIndex(cells=>cells.some(c=>text(c).toLowerCase()==='name')),header=(headerRow>=0?grid.splice(0,headerRow+1).at(-1):[])?.map(c=>text(c).replace(/\s*\[.*?\]/g,''))||[],nameIndex=header.findIndex(h=>h.toLowerCase()==='name'),typeIndex=header.findIndex(h=>h.toLowerCase()==='type'),iconIndex=header.findIndex(h=>h.toLowerCase()==='icon');
  if(nameIndex<0)continue;
  const candidates=grid.map(cells=>{const name=text(cells[nameIndex]),kind=slot==='Passive'?text(cells[typeIndex]).replace(/^Passive\s+/i,'').toUpperCase():slot;const img=cells[iconIndex]?.querySelector('img');const raw=img?.getAttribute('data-src')||img?.getAttribute('src')||'';const linked=img?.closest('a')?.getAttribute('href')||'';const original=linked.startsWith('https://static.wikia.nocookie.net/')?linked:raw;const icon=/^https:\/\/static\.wikia\.nocookie\.net\//.test(original)?original.replace(/\/scale-to-width-down\/\d+/,''):null;const thumbnail=/^https:\/\/static\.wikia\.nocookie\.net\//.test(raw)?raw:null;return {slot:kind as SkillSlot,name,icon,thumbnail};}).filter(s=>skillSlots.includes(s.slot)&&s.name&&s.name.length<=150);
  if(slot==='Passive'){skills.push(...highestWikiPassives(candidates));}else if(candidates.length)skills.push(candidates[candidates.length-1]);
 }
 for(const skill of skills.filter(s=>s.slot==='Weapon')){
  const images=Array.from(doc.querySelectorAll('img'));
  const sources=(img:Element)=>[img.closest('a')?.getAttribute('href'),img.getAttribute('data-src'),img.getAttribute('data-original'),img.getAttribute('src'),...(img.getAttribute('data-srcset')||img.getAttribute('srcset')||'').split(',').map(part=>part.trim().split(/\s+/)[0])].filter((v):v is string=>!!v).map(value=>value.startsWith('//')?'https:'+value:value);
  const image=images.find(img=>{const names=[img.getAttribute('alt'),img.getAttribute('data-image-name'),img.getAttribute('data-image-key'),...sources(img).map(value=>{try{return decodeURIComponent(new URL(value).pathname.split('/revision')[0].split('/').at(-1)||'');}catch{return '';}})];return names.some(value=>value&&wikiMatch(value.replace(/\.(png|webp|jpe?g)$/i,'').replace(/_/g,' '),skill.name+' W'));});
  const valid=image?sources(image).filter(value=>{try{const url=new URL(value);return url.protocol==='https:'&&url.hostname==='static.wikia.nocookie.net'&&!url.username&&!url.password&&!url.port;}catch{return false;}}):[];
  skill.refineIcon=valid[0]?.replace(/\/scale-to-width-down\/\d+/,'')||null;
  skill.refineThumbnail=valid.find(value=>value.includes('/scale-to-width-down/'))||valid[0]||null;
 }
 return {title,version,releaseDate,skills,url};
}
export async function fetchWikiHero(value:string){
 const {page,url}=wikiPageUrl(value);let data:{parse?:{title:string;text:string};error?:{info?:string}};
 try{data=await communityApi('/wiki-hero-import',{url});}
 catch(serverError){
  // The public API remains a fallback if the import service is briefly unavailable.
  // Never send website credentials or cookies to Fandom.
  const endpoint=new URL('https://feheroes.fandom.com/api.php');endpoint.search=new URLSearchParams({action:'parse',page,prop:'text',format:'json',formatversion:'2',redirects:'1',origin:'*'}).toString();
  try{const response=await fetch(endpoint,{credentials:'omit',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error();data=await response.json();}
  catch{const message=serverError instanceof Error?serverError.message:'';throw Error(!message||/failed to fetch|networkerror|load failed/i.test(message)?'Could not connect to the wiki import service. Please check your connection and retry.':message);}
 }
 if(data.error||typeof data.parse?.text!=='string'||typeof data.parse?.title!=='string')throw Error(data.error?.info||'Hero page not found.');
 if(data.parse.text.length>3000000)throw Error('This wiki page is too large.');
 return parseWikiHero(data.parse.text,data.parse.title,url);
}

export async function downloadWikiSkillIcon(skill:WikiSkill){
 for(const value of [...new Set([skill.icon,skill.thumbnail].filter(Boolean))]){
  try{const url=new URL(value!);if(url.protocol!=='https:'||url.hostname!=='static.wikia.nocookie.net'||url.username||url.password||url.port)continue;
   const response=await fetch(url.href,{credentials:'omit',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(12000)});if(!response.ok)continue;
   const blob=await response.blob();if(!['image/png','image/jpeg','image/webp'].includes(blob.type)||!blob.size||blob.size>10485760)continue;
   return new File([blob],'wiki-skill-icon',{type:blob.type});
  }catch{}
 }
 throw Error('The wiki icon is unavailable.');
}
