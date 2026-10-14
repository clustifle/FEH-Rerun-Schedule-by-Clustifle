import {assetUrl} from './static-data';
export type BlessingHero={category?:string;blessing?:string|null;debut_version?:string|null;release_date?:string|null};
export function mythicBonus(hero:BlessingHero):1|2|3|null{
 if(hero.category!=='Mythic')return null;
 const match=hero.debut_version?.trim().match(/^v?(\d+)\.(\d+)(?:\.\d+)?$/i);
 if(match){const major=Number(match[1]);if(major>=3)return major>=9?3:major>=5?2:1;}
 if(hero.release_date&&/^\d{4}-\d{2}-\d{2}$/.test(hero.release_date))return hero.release_date>='2024-12-06'?3:hero.release_date>='2020-12-08'?2:1;
 return null;
}
export const mythicBonusNotes={1:'Ally Boost · introduced with Eir: Merciful Death in v3.0.0.',2:'Ally Boost + additional Aether Raids team slot · introduced with Reginn: Bearing Hope in v5.0.0.',3:'Ally Boost + additional team slot + reinforcement slot from turn 3 with a Calling Circle · introduced with Rune: Source of Wisdom in v9.0.0.'};
export function blessingIcon(category:string,blessing:string,hero:BlessingHero={}){
 if(category==='Mythic')return assetUrl('mythic-bonuses/'+(mythicBonus({...hero,category})||1)+'/'+blessing.toLowerCase()+'.webp');
 return assetUrl((category==='Chosen Hero'?'chosen/':'blessings/')+blessing.toLowerCase()+(category==='Chosen Hero'?'.png':'.webp'));
}
