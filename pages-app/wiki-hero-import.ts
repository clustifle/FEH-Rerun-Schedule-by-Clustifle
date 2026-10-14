import {isStarterHero,autoImportPool} from './hero-pools';
import {communityApi} from './community-api';
import {skillSlots,type SkillSlot} from './hero-skills';
export type WikiSkill={slot:SkillSlot;name:string;icon:string|null;thumbnail?:string|null;refineIcon?:string|null;refineThumbnail?:string|null};
export type WikiHero={title:string;version:string|null;releaseDate:string|null;skills:WikiSkill[];url:string;identity?:{name:string;title:string;portrait:string|null;portraitThumbnail?:string|null;moveType:string|null;weaponType:string|null;color:string|null;heroType:string;blessing:string|null;demote?:boolean;heroicGrail?:boolean;isSpecial?:boolean;pool?:string|null}};
export function wikiPageUrl(value:string){
 let url:URL,page:string;try{url=new URL(value.trim());page=decodeURIComponent(url.pathname.slice(url.pathname.startsWith('/wiki/')?6:url.hostname==='feheroes.gamepedia.com'?1:6));if(/%[0-9a-f]{2}/i.test(page))page=decodeURIComponent(page);if(/[\u0000-\u001f\u007f]/u.test(page))throw Error('Invalid page characters');page=page.normalize('NFC').replace(/[\u2018\u2019\u02bc]/g,"'").replace(/[\u2010-\u2015\u2212]/g,'-').replace(/_/g,' ').replace(/\s+/gu,' ').trim();}catch{throw Error('Use a valid FEH Wiki hero page URL.');}
 if(value.length>2000||url.protocol!=='https:'||!['feheroes.fandom.com','feheroes.gamepedia.com'].includes(url.hostname)||url.username||url.password||url.port||(!url.pathname.startsWith('/wiki/')&&url.hostname!=='feheroes.gamepedia.com'))throw Error('Use an HTTPS hero page from feheroes.fandom.com.');
 if(!page.includes(':')||/^(File|Template|Category|Special|Module|User|Talk):/i.test(page)||page.includes('/')||/[\u0000-\u001f\u007f]/u.test(page))throw Error('Choose a hero page, not an image, category or subpage.');
 return {page,url:'https://feheroes.fandom.com/wiki/'+encodeURIComponent(page.replace(/ /g,'_'))};
}
const text=(el:Element|undefined|null)=>el?.textContent?.normalize('NFC').replace(/\s+/g,' ').trim()||'';
export const wikiHeroName=(name:string)=>name.normalize('NFC').replace(/\s*\((?:M|F|Y|A)\)\s*$/i,'').trim();
const matchKey=(value:string)=>value.normalize('NFKD').toLowerCase().replace(/\p{M}/gu,'').replace(/[ðþæøœłß]/g,letter=>({'ð':'d','þ':'th','æ':'ae','ø':'o','œ':'oe','ł':'l','ß':'ss'}[letter]!)).replace(/\s*\((?:m|f|y|a)\)(?=\s*:|\s*$)/g,'').replace(/[^\p{L}\p{N}]/gu,'');
export const wikiMatch=(a:string,b:string)=>!!matchKey(a)&&matchKey(a)===matchKey(b);
export function wikiHeroTypes(doc:Document){
 const values:string[]=[];
 for(const tr of doc.querySelectorAll('tr')){
  const cells=Array.from(tr.children),label=text(cells[0]).replace(/\[[^\]]*\]/g,'').replace(/:$/,'').trim();
  if(!/^(?:hero types?|rarities|rarity)$/i.test(label))continue;
  for(const cell of cells.slice(1)){
   values.push(text(cell));
   for(const node of cell.querySelectorAll('img,a,span'))for(const attr of ['alt','title','aria-label','data-image-name','data-image-key']){const value=node.getAttribute(attr);if(value)values.push(value.replace(/_/g,' '));}
   for(const a of cell.querySelectorAll('a[href]')){try{values.push(decodeURIComponent(a.getAttribute('href')!).replace(/_/g,' '));}catch{}}
  }
 }
 const combined=values.join(' ').replace(/Special\s+(?:Hero\s+)?(?:Special\s+)?Rate/gi,''),special=/\bSpecial(?:\s+Heroes?)?\b/i.test(combined);
 // A seasonal Duo/Harmonized/etc. keeps its distinctive type. Special wins
 // over a plain General tag, never over a recognized specialized hero type.
 const primary=['Chosen Hero','Legendary','Mythic','Emblem','Attuned','Rearmed','Ascended','Harmonized','Duo','Aided','Entwined','Vista'].find(type=>new RegExp('\\b'+type.replace(' ','\\s+')+'(?:\\s+Heroes?)?\\b','i').test(combined));
 return {heroType:primary||(special?'Special':'General'),special};
}
export function wikiAvailability(doc:Document){
 const values:string[]=[];
 for(const tr of doc.querySelectorAll('tr')){const cells=Array.from(tr.children);if(!/^rarities$/i.test(text(cells[0])))continue;for(const cell of cells.slice(1)){const clone=cell.cloneNode(true) as Element;for(const img of clone.querySelectorAll('img'))img.replaceWith(doc.createTextNode(' '+(img.getAttribute('alt')||'★')+' '));values.push(text(clone));for(const node of cell.querySelectorAll('a,img'))for(const attr of ['title','alt','href']){const value=node.getAttribute(attr);if(value)try{values.push(decodeURIComponent(value).replace(/_/g,' '));}catch{}}}break;}
 const value=values.join(' '),rarities=[...value.matchAll(/(?:^|\s|—|–)([345])(?=\s|★|☆|—|–|$)/g)].map(m=>Number(m[1]));
 const specialRate=/\b(?:SR|SHSR)\b|Special\s+(?:Hero\s+)?(?:Special\s+)?Rate/i.test(value),focus=/\bFocus\b/i.test(value);
 // These are acquisition tags in the identity table, not later event history.
 // Summonable seasonal reruns may now also have a Tempest Trials tag.
 const ghb=/Grand\s+Hero\s+Battles?|\bGHB\b/i.test(value),tt=/Tempest\s+Trials?/i.test(value);
 const heroicGrail=ghb||(/Heroic\s+Grails?/i.test(value)&&!specialRate&&!focus)||(tt&&!specialRate&&!focus&&rarities.includes(4)&&rarities.includes(5));
 const demote=!heroicGrail&&!specialRate&&rarities.includes(4)&&(rarities.includes(3)||rarities.includes(5));
 return {demote,heroicGrail};
}
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
 const info=new Map<string,Element>();for(const tr of doc.querySelectorAll('tr')){const cells=Array.from(tr.children),label=text(cells[0]);if(cells[1]&&!info.has(label))info.set(label,cells[1]);}
 const weapon=text(info.get('Weapon Type')),move=text(info.get('Move Type')||info.get('Movement Type'));
 const weaponType=weapon.match(/sword|lance|axe|staff|beast|bow|breath|dragon|dagger|tome/i)?.[0],color=weapon.match(/red|blue|green|colorless/i)?.[0]||(weaponType?({sword:'Red',lance:'Blue',axe:'Green',staff:'Colorless'}[weaponType.toLowerCase()]||null):null);
 const portraitImage=Array.from(doc.querySelectorAll('img')).find(img=>[img.getAttribute('alt'),img.getAttribute('data-image-name'),img.getAttribute('data-image-key')].some(value=>value&&wikiMatch(value.replace(/\.(webp|png|jpe?g)$/i,'').replace(/_/g,' '),title.replace(':',' ')+' Face FC')));
 const rawPortrait=portraitImage?.getAttribute('data-src')||portraitImage?.getAttribute('data-original')||portraitImage?.getAttribute('src')||'';
 let portrait:string|null=null;try{const source=new URL(rawPortrait),filename=decodeURIComponent(source.pathname.split('/revision')[0].split('/').at(-1)||'').replace(/\.(webp|png|jpe?g)$/i,'').replace(/_/g,' ');if(source.protocol==='https:'&&source.hostname==='static.wikia.nocookie.net'&&!source.username&&!source.password&&!source.port&&wikiMatch(filename,title.replace(':',' ')+' Face FC'))portrait=source.href.replace(/\/scale-to-width-down\/\d+/,'');}catch{}
 const {heroType,special}=wikiHeroTypes(doc);
 const effect=text(info.get('Legendary Effect')||info.get('Mythic Effect')),blessing=effect.match(/\b(Earth|Fire|Water|Wind|Light|Dark|Astra|Anima)\b/i)?.[0]||null;
 const colon=title.indexOf(':');const identity={pool:null as string|null,isSpecial:special,...wikiAvailability(doc),name:title.slice(0,colon).trim(),title:title.slice(colon+1).trim(),portrait,portraitThumbnail:portrait?rawPortrait:null,moveType:(/Flying|Flier/i.test(move)?'Fliers':move.match(/Infantry|Cavalry|Armored/i)?.[0]||null),weaponType:weaponType?weaponType.toLowerCase()==='dragon'?'Breath':weaponType[0].toUpperCase()+weaponType.slice(1).toLowerCase():null,color:color?color[0].toUpperCase()+color.slice(1).toLowerCase():null,heroType:heroType.toLowerCase()==='chosen hero'?'Chosen Hero':heroType[0].toUpperCase()+heroType.slice(1).toLowerCase(),blessing:blessing?blessing[0].toUpperCase()+blessing.slice(1).toLowerCase():null};
 if(isStarterHero({name:identity.name,title:identity.title,category:identity.heroType})){identity.demote=false;identity.heroicGrail=false;}identity.pool=autoImportPool({...identity,category:identity.heroType,heroic_grail:identity.heroicGrail});return {title,version,releaseDate,skills,url,identity};
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
