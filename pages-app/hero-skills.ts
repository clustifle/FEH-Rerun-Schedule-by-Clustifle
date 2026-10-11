import {assetUrl} from './static-data';
import {weaponTypes} from './weapon-types';
import {supabase} from './static-data';
export const skillSlots=['Weapon','Assist','Special','A','B','C','X'] as const;
export type SkillSlot=typeof skillSlots[number];
export type HeroSkill={id:string;hero_id:string|null;slot:SkillSlot;family:string;name:string;tier:number|null;description:string;refine_effect?:string;refined:boolean;icon_url:string|null;remix:boolean;sp:number|null;cooldown?:number|null;might?:number|null;range?:number|null;rarity:string;prerequisites?:string;restrictions:string;exclusive?:boolean;inherit_moves?:string[];inherit_weapons?:string[];source_url:string;revision:number};
export const slotIcons={Weapon:'weapon',Assist:'assists',Special:'special',A:'a_passive',B:'b_passive',C:'c_passive',X:'x_extracted'};
export async function loadHeroSkills(id:string){const {data,error}=await supabase.from('tracker_hero_skills').select('*').eq('hero_id',id).order('name');if(error)throw Error(error.message);return data as HeroSkill[];}
export function bestSkills(rows:HeroSkill[]){const best=new Map<string,HeroSkill>();for(const s of rows){const key=[s.slot,s.family.trim().toLowerCase()||s.name.trim().toLowerCase(),s.refined,s.remix].join('|');const old=best.get(key);if(!old||(s.tier||0)>(old.tier||0))best.set(key,s);}return [...best.values()];}

export async function loadSkillCatalog(){const all:HeroSkill[]=[];for(let start=0;;start+=1000){const {data,error}=await supabase.from("tracker_hero_skills").select("*").order("id").range(start,start+999);if(error)throw Error(error.message);all.push(...data);if(data.length<1000)break;}return all;}

export const inheritanceWeaponTypes=Object.entries(weaponTypes).flatMap(([color,types])=>types.map(type=>color+' '+type));
export function inheritanceWeaponIcon(type:string){if(type.includes(' '))return assetUrl('weapon-types/'+type.toLowerCase().replace(' ','-')+'.webp');const color=({Sword:"red",Lance:"blue",Axe:"green",Staff:"colorless"} as Record<string,string>)[type]||"colorless";return assetUrl("weapon-types/"+color+"-"+type.toLowerCase()+".webp");}
