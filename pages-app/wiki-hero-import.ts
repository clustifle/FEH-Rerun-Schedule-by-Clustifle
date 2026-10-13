import {skillSlots,type SkillSlot} from './hero-skills';
export type WikiSkill={slot:SkillSlot;name:string;icon:string|null};
export type WikiHero={title:string;version:string|null;releaseDate:string|null;skills:WikiSkill[];url:string};
export function wikiPageUrl(value:string){const url=new URL(value);if(url.protocol!=='https:'||url.hostname!=='feheroes.fandom.com'||url.username||url.password||url.port||!url.pathname.startsWith('/wiki/'))throw Error('Use an HTTPS hero page from feheroes.fandom.com.');const page=decodeURIComponent(url.pathname.slice(6)).replace(/_/g,' ');if(!page.includes(':')||/^(File|Template|Category|Special|Module|User|Talk):/i.test(page)||page.includes('/'))throw Error('Choose a hero page, not an image, category or subpage.');return {page,url:'https://feheroes.fandom.com/wiki/'+encodeURIComponent(page.replace(/ /g,'_'))};}
const text=(el:Element|undefined|null)=>el?.textContent?.replace(/\s+/g,' ').trim()||'';
export const wikiMatch=(a:string,b:string)=>a.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/\s*\([MF]\)/g,'').replace(/[^a-z0-9]/gi,'').toLowerCase()===b.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/\s*\([MF]\)/g,'').replace(/[^a-z0-9]/gi,'').toLowerCase();
function rows(table:Element){const result:Element[][]=[],carry=new Map<number,{cell:Element;left:number}>();for(const tr of table.querySelectorAll('tr')){const out:Element[]=[];for(const [i,c] of carry){out[i]=c.cell;if(--c.left===0)carry.delete(i);}let col=0;for(const cell of tr.children){if(!['TD','TH'].includes(cell.tagName))continue;while(out[col])col++;out[col]=cell;const span=Number(cell.getAttribute('rowspan')||1);if(span>1)carry.set(col,{cell,left:span-1});col++;}result.push(out);}return result;}
export function parseWikiHero(html:string,title:string,url:string):WikiHero{
 const doc=new DOMParser().parseFromString(html,'text/html');
 const metadata=new Map<string,string>();for(const tr of doc.querySelectorAll('tr')){const cells=Array.from(tr.children);const label=text(cells[0]);if(['Version','Release Date'].includes(label)&&cells[1])metadata.set(label,text(cells[1]));}
 const version=metadata.get('Version')?.match(/^\d+\.\d+(?:\.\d+)?$/)?.[0]||null,releaseDate=metadata.get('Release Date')?.match(/^\d{4}-\d{2}-\d{2}$/)?.[0]||null;
 if(!version&&!releaseDate)throw Error('This page does not contain recognizable hero release information.');
 const skills:WikiSkill[]=[];
 for(const [section,slot] of [['Weapons','Weapon'],['Assists','Assist'],['Specials','Special'],['Passives','Passive']]){
  let node=doc.getElementById(section)?.closest('h2,h3')?.nextElementSibling;let table:Element|undefined;
  while(node&&!/^H[23]$/.test(node.tagName)){if(node.tagName==='TABLE'){table=node;break;}node=node.nextElementSibling;}
  if(!table)continue;const grid=rows(table),header=grid.shift()?.map(text)||[],nameIndex=header.indexOf('Name'),typeIndex=header.indexOf('Type'),iconIndex=header.indexOf('Icon');
  if(nameIndex<0)continue;
  const candidates=grid.map(cells=>{const name=text(cells[nameIndex]),kind=slot==='Passive'?text(cells[typeIndex]):slot;const img=cells[iconIndex]?.querySelector('img');const raw=img?.getAttribute('data-src')||img?.getAttribute('src')||'';const icon=/^https:\/\/static\.wikia\.nocookie\.net\//.test(raw)?raw.replace(/\/scale-to-width-down\/\d+/,''):null;return {slot:kind as SkillSlot,name,icon};}).filter(s=>skillSlots.includes(s.slot)&&s.name&&s.name.length<=150);
  if(slot==='Passive'){const best=new Map<string,WikiSkill>();for(const s of candidates){const family=s.slot+'|'+s.name.replace(/\s+[1-4]$/,'');const old=best.get(family);if(!old||Number(s.name.match(/\s([1-4])$/)?.[1]||0)>=Number(old.name.match(/\s([1-4])$/)?.[1]||0))best.set(family,s);}skills.push(...best.values());}else if(candidates.length)skills.push(candidates[candidates.length-1]);
 }
 return {title,version,releaseDate,skills,url};
}
export async function fetchWikiHero(value:string){const {page,url}=wikiPageUrl(value);const endpoint=new URL('https://feheroes.fandom.com/api.php');endpoint.search=new URLSearchParams({action:'parse',page,prop:'text',format:'json',formatversion:'2',origin:'*'}).toString();const response=await fetch(endpoint,{credentials:'omit',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('The wiki is unavailable. Try again shortly.');const data=await response.json().catch(()=>{throw Error('The wiki returned a verification page. Open the source wiki page in your browser, then try again.');});if(data.error||!data.parse?.text)throw Error(data.error?.info||'Hero page not found.');if(data.parse.text.length>3000000)throw Error('This wiki page is too large.');return parseWikiHero(data.parse.text,data.parse.title,url);}
