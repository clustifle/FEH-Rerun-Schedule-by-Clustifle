import {defaultSpecialRateRanges,validateSpecialRateRanges,inSpecialRateRange,type SpecialRateRanges} from '../lib/special-rate-ranges';
export type PoolRangeSettings={ranges:SpecialRateRanges;revision:number;updatedAt:string|null};
let poolSettings:PoolRangeSettings={ranges:defaultSpecialRateRanges,revision:0,updatedAt:null};
const rangeListeners=new Set<()=>void>();
export const getPoolRangeSettings=()=>poolSettings;
export const subscribePoolRangeSettings=(fn:()=>void)=>{rangeListeners.add(fn);return()=>{rangeListeners.delete(fn);};};
export function setPoolRangeSettings(value:PoolRangeSettings){const ranges=validateSpecialRateRanges(value.ranges);if(!Number.isSafeInteger(value.revision)||value.revision<0)throw Error('Invalid pool settings revision.');if(value.revision<poolSettings.revision||JSON.stringify(poolSettings)===JSON.stringify(value))return;poolSettings={ranges,revision:value.revision,updatedAt:value.updatedAt};rangeListeners.forEach(fn=>fn());}
export const pools=['General Pool','Non-Seasonal Limited','Seasonal Limited','L/M/E Pool','Grail Pool'];
export const specialRatePools=['General Pool (4★ SR)','Seasonal Limited Pool (4★ SHSR)'];
type PoolHero={name?:string;title?:string;category:string;pool?:string|null;debut_version?:string|null;release_date?:string|null;heroic_grail?:boolean;demote?:boolean;isSpecial?:boolean};
export function autoImportPool(hero:PoolHero){
 if(isStarterHero(hero))return null;
 if(hero.heroic_grail)return 'Grail Pool';
 if(hero.isSpecial&&!['Legendary','Mythic','Emblem','Chosen Hero'].includes(hero.category))return 'Seasonal Limited';
 return defaultPool(hero.category);
}
export function isStarterHero(hero:{name?:string;title?:string;category?:string}|null|undefined){
 if(!hero||hero.category!=='General')return false;
 const key=[hero.name,hero.title].map(s=>s?.normalize('NFKC').trim().toLowerCase()||'').join('|');
 return ['alfonse|prince of askr','anna|commander','sharena|princess of askr'].includes(key);
}
export function displayPool(hero:PoolHero,ranges:SpecialRateRanges=poolSettings.ranges){
 if(isStarterHero(hero))return 'Starter unit (no summoning pool)';
 const stored=normalizePool(hero.pool,hero.category);
 const base=stored===specialRatePools[0]?'General Pool':stored===specialRatePools[1]?'Seasonal Limited':stored;
 if(hero.demote||hero.heroic_grail||['Rearmed','Attuned','Legendary','Mythic','Emblem','Chosen Hero'].includes(hero.category))return base;
 if(base==='General Pool'&&!hero.demote&&inSpecialRateRange(hero,ranges.sr))return specialRatePools[0];
 if(base==='Seasonal Limited'&&inSpecialRateRange(hero,ranges.shsr))return specialRatePools[1];
 return base;
}
export function defaultPool(category:string){
 if(['Legendary','Mythic','Emblem'].includes(category))return 'L/M/E Pool';
 if(['Special','Duo','Harmonized'].includes(category))return 'Seasonal Limited';
 if(['Rearmed','Attuned','Aided','Entwined','Vista','Chosen Hero'].includes(category))return 'Non-Seasonal Limited';
 return 'General Pool';
}
export function normalizePool(pool:string|null|undefined,category:string){
 if(pool==='Limited Pool'||pool==='Special Heroes Pool')return ['Special','Duo','Harmonized'].includes(category)?'Seasonal Limited':'Non-Seasonal Limited';
 return pool||defaultPool(category);
}
