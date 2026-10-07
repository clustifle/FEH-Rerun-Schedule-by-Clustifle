export const pools=['General Pool','Non-Seasonal Limited','Seasonal Limited','L/M/E Pool','Grail Pool'];
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
