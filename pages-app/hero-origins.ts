import catalog from './origin-catalog.json';
import manifest from '../public/images/game-origins/manifest.json';

export const originGames=manifest.icons.map(icon=>({id:icon.assetIndex,name:icon.name,file:icon.file}));
export const originKey=(value:string)=>value.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/\([^)]*\)/g,'').replace(/[^a-z0-9]/g,'');
const entries=new Map(catalog.entries.map(entry=>[originKey(entry.hero),entry]));
type Identity={id?:string;name:string;title:string};
export function heroOrigin(hero:Identity):{position:number;origins:number[]}|undefined{
 return entries.get(originKey(hero.name+': '+hero.title));
}
export function heroOriginNames(hero:Identity){return (heroOrigin(hero)?.origins||[]).map(id=>originGames[id]?.name).filter(Boolean).join(' · ');}
export function compareGameOrder(a:Identity,b:Identity){return (heroOrigin(a)?.position??Number.MAX_SAFE_INTEGER)-(heroOrigin(b)?.position??Number.MAX_SAFE_INTEGER);}
