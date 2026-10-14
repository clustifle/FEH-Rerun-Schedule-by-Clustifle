import {downloadWikiSkillIcon,type WikiHero} from './wiki-hero-import';
import {importHeroPortrait} from './community-api';
import type {ImportedHeroSkill} from './AdminHeroSkills';

// The browser and import service have different CDN access paths. Try both,
// including the exact variant's thumbnail when the original is unavailable.
export async function downloadWikiImage(icon:string,thumbnail?:string|null){
 // Some wiki pages expose only an original URL. The CDN's scaled revision
 // provides a second download route without changing the image filename.
 const scaled=icon.includes('/revision/')?icon.split('/revision/')[0]+'/revision/latest/scale-to-width-down/256':null;
 const candidates=[...new Set([icon,thumbnail,scaled].filter(Boolean))];
 try{return await downloadWikiSkillIcon({slot:'Weapon',name:'',icon,thumbnail:thumbnail||scaled});}catch{}
 for(const url of candidates){
  try{return await importHeroPortrait(url!);}catch{}
 }
 throw Error('Could not download this wiki image. Please retry.');
}
export async function prepareWikiHeroSkills(wiki:WikiHero):Promise<ImportedHeroSkill[]>{
 const entries:ImportedHeroSkill[]=[];
 for(const s of wiki.skills){
  if(s.slot==='X'&&!wiki.identity?.heroType.toLowerCase().includes('attuned'))continue;
  const refined=s.slot==='Weapon'&&!!s.refineIcon;
  const needsIcon=refined||['A','B','C','X'].includes(s.slot);
  const icon=refined?s.refineIcon:s.icon;
  if(needsIcon&&!icon)throw Error('No wiki icon found for '+s.name+'. Use the Legacy editor to add it manually.');
  let file:File|null=null;
  if(needsIcon){try{file=await downloadWikiImage(icon!,refined?s.refineThumbnail:s.thumbnail);}catch{throw Error('Could not import the icon for '+s.name+'. Please retry; nothing has been applied.');}}
  entries.push({file,skill:{id:crypto.randomUUID(),hero_id:null,slot:s.slot,name:s.name,family:s.name.replace(/\s+[1-4]$/,''),tier:null,description:'',refined,arcane:s.slot==='Weapon'&&wiki.identity?.heroType==='Rearmed',icon_url:null,remix:false,sp:null,rarity:'',prerequisites:'',restrictions:'',exclusive:false,inherit_moves:[],inherit_weapons:[],source_url:wiki.url,revision:1}});
 }
 return entries;
}
