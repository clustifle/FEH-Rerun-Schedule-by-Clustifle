export const refineGroups=['Main Pool','Seasonal','Heroic Grails','L/M/E'] as const;
export const refineStatuses=['predicted','alternative','announced','released','waiting','uncertain'] as const;
export type RefineEntry={id:string;heroId:string|null;name:string;title:string;weapon:string;group:typeof refineGroups[number];status:typeof refineStatuses[number];month:string|null;version:string;releaseDate:string;source:string;note:string;order:number};
export type RefineBoard={entries:RefineEntry[];revision:number;updatedAt:string|null};
const monthPattern=/^\d{4}-(0[1-9]|1[0-2])$/;
export function validateRefines(input:unknown):RefineEntry[]{
 if(!Array.isArray(input)||input.length>2000)throw Error('Use up to 2,000 refine entries.');
 const ids=new Set<string>(),identities=new Set<string>();
 return input.map(value=>{
  if(!value||typeof value!=='object')throw Error('Invalid refine entry.');
  const v=value as Record<string,unknown>,str=(key:string,max:number)=>{if(typeof v[key]!=='string'||(v[key] as string).length>max)throw Error('Invalid '+key+' field.');return (v[key] as string).trim();};
  const id=str('id',80),name=str('name',100),title=str('title',150),weapon=str('weapon',150),version=str('version',30),releaseDate=str('releaseDate',10),source=str('source',2000),note=str('note',500);
  if(!/^[a-zA-Z0-9_-]{1,80}$/.test(id)||ids.has(id)||!name)throw Error('Choose a hero and use unique refine entries.');ids.add(id);
  if(!refineGroups.includes(v.group as never)||!refineStatuses.includes(v.status as never))throw Error('Choose a valid group and status.');
  const status=v.status as RefineEntry['status'],month=v.month===null?null:str('month',7);
  if(month&&!monthPattern.test(month)||!month&&!['waiting','uncertain'].includes(status))throw Error('Choose a valid refine month.');
  if(v.heroId!==null&&(typeof v.heroId!=='string'||!/^[a-f0-9-]{36}$/i.test(v.heroId)))throw Error('Choose a valid hero.');
  if(version&&!/^\d+\.\d+(?:\.\d+)?$/.test(version))throw Error('Use a version such as 10.10.');
  if(releaseDate&&(!/^\d{4}-\d{2}-\d{2}$/.test(releaseDate)||!Number.isFinite(Date.parse(releaseDate))||new Date(releaseDate).toISOString().slice(0,10)!==releaseDate))throw Error('Choose a valid release date.');
  if(releaseDate&&month&&releaseDate.slice(0,7)!==month)throw Error('Release date must match the refine month.');
  if(source){let url:URL;try{url=new URL(source)}catch{throw Error('Use an HTTPS source link.')}if(url.protocol!=='https:'||url.username||url.password)throw Error('Use an HTTPS source link.');}
  if(['announced','released'].includes(status)&&!source)throw Error('Add a source for announced or released refines.');
  const identity=[name.normalize('NFKC').toLowerCase(),title.normalize('NFKC').toLowerCase(),weapon.normalize('NFKC').toLowerCase(),month||'',status==='alternative'?'alternative':status==='waiting'||status==='uncertain'?'waiting':'batch'].join('|');
  if(identities.has(identity))throw Error('This hero and weapon are already in this batch.');identities.add(identity);
  return {id,heroId:v.heroId as string|null,name,title,weapon,group:v.group as RefineEntry['group'],status,month,version,releaseDate,source,note,order:Number.isSafeInteger(v.order)&&Number(v.order)>=0?Number(v.order):0};
 });
}
export function localRefineMonth(date=new Date()){return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0');}
export function refineHeroKey(name:string,title:string){return (name.replace(/\s*\((?:M|F|Y|A)\)\s*$/i,'')+':'+title).normalize('NFKD').replace(/\p{M}/gu,'').replace(/[’‘]/g,"'").replace(/\s+/g,' ').toLowerCase().trim();}
