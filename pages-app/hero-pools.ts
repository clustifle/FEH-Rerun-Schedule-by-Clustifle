export const pools=['General Pool','Non-Seasonal Limited','Seasonal Limited','L/M/E Pool','Grail Pool'];
export const specialRatePools=['General Pool (4★ SR)','Seasonal Limited Pool (4★ SHSR)'];
type PoolHero={name?:string;title?:string;category:string;pool?:string|null;debut_version?:string|null;release_date?:string|null;heroic_grail?:boolean;demote?:boolean};
export function isStarterHero(hero:{name?:string;title?:string;category?:string}|null|undefined){
 if(!hero||hero.category!=='General')return false;
 const key=[hero.name,hero.title].map(s=>s?.normalize('NFKC').trim().toLowerCase()||'').join('|');
 return ['alfonse|prince of askr','anna|commander','sharena|princess of askr'].includes(key);
}
function withinCutoff(hero:PoolHero,major:number,minor:number,lastDate:string){
 const version=hero.debut_version?.trim().match(/^v?(\d+)\.(\d+)(?:\.\d+)?$/i);
 if(version){const a=Number(version[1]),b=Number(version[2]);return a>=1&&(a<major||(a===major&&b<=minor));}
 return !!hero.release_date&&/^\d{4}-\d{2}-\d{2}$/.test(hero.release_date)&&hero.release_date>='2017-02-02'&&hero.release_date<=lastDate;
}
export function displayPool(hero:PoolHero){
 if(isStarterHero(hero))return 'Starter unit (no summoning pool)';
 const base=normalizePool(hero.pool,hero.category);
 if(hero.demote||hero.heroic_grail||['Rearmed','Attuned','Legendary','Mythic','Emblem','Chosen Hero'].includes(hero.category))return base;
 if(base==='General Pool'&&!hero.demote&&withinCutoff(hero,8,1,'2024-01-31'))return specialRatePools[0];
 if(base==='Seasonal Limited'&&withinCutoff(hero,7,1,'2023-01-31'))return specialRatePools[1];
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
