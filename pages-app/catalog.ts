import {useSyncExternalStore} from 'react';
export type Definition={kind:'hero_type'|'pool';name:string;description:string;icon_path:string;active:boolean;sort_order:number};
export const baseTypes=['Legendary','Mythic','Emblem','Chosen Hero','Rearmed','Attuned','Aided','Entwined','Duo','Harmonized','Vista','General','Special'];
export const basePools=['General Pool','Non-Seasonal Limited','Seasonal Limited','L/M/E Pool','Grail Pool'];
let definitions:Definition[]=[];
const listeners=new Set<()=>void>();
export function setDefinitions(rows:Definition[]){definitions=rows;listeners.forEach(fn=>fn());}
export function useDefinitions(){return useSyncExternalStore(fn=>{listeners.add(fn);return()=>listeners.delete(fn);},()=>definitions);}
export function definitionNames(rows:Definition[],kind:Definition['kind'],used:string[]=[]){return [...new Set([...(rows.length?rows.filter(r=>r.kind===kind&&r.active).sort((a,b)=>a.sort_order-b.sort_order).map(r=>r.name):kind==='hero_type'?baseTypes:basePools),...used.filter(Boolean)])];}
export function definitionIcon(rows:Definition[],kind:Definition['kind'],name:string){return rows.find(r=>r.kind===kind&&r.name===name)?.icon_path||'';}
