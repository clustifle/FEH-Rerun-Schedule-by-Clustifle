import {blessingIcon} from './blessing-icons';
import {useDefinitions,definitionIcon} from './catalog';
import {portraitUrl as heroPortraitUrl,assetUrl} from './static-data';
export type Hero={debut_version?:string|null;release_date?:string|null;id:string;name:string;title:string;category:string;color:string;portrait:string|null;pool?:string|null;blessing?:string|null;heroic_grail?:boolean;weapon_type?:string|null;move_type?:string|null;schedule?:string;month?:string|null;notes?:string;demote?:boolean};
const kindClass=(h:Hero)=>['Legendary','Mythic','Chosen Hero'].includes(h.category)?h.blessing?.toLowerCase()||'unblessed':h.category.toLowerCase();
export function HeroTypeTag({hero}:{hero:Hero}){
 const definitions=useDefinitions();
 if(hero.heroic_grail)return <span className="hero-type-signature grail-signature"><img src={assetUrl('hero-types/heroic-grails.webp')} alt="" width={32} height={32}/><span className="hero-type-copy"><strong>Heroic Grails</strong></span></span>;
 const label=hero.category==='Chosen Hero'?'Chosen':hero.category;
 const customIcon=definitionIcon(definitions,'hero_type',hero.category);
 if(customIcon&&!['Legendary','Mythic','Chosen Hero'].includes(hero.category))return <span className="hero-type-signature"><img src={customIcon.startsWith('mods-icons/')?heroPortraitUrl(customIcon):assetUrl(customIcon)} alt="" width={32} height={32}/><span className="hero-type-copy"><strong>{label}</strong></span></span>;
 if(['General','Special'].includes(hero.category))return <span className={'hero-type-signature '+hero.category.toLowerCase()+'-signature'}><img src={assetUrl('pools/'+(hero.category==='General'?'general':'special')+'.webp')} alt="" width={32} height={32}/><span className="hero-type-copy"><strong>{label}</strong></span></span>;
 if(['Emblem','Duo','Harmonized','Ascended','Rearmed','Attuned','Aided','Entwined','Vista'].includes(hero.category))return <span className={'hero-type-signature '+hero.category.toLowerCase()+'-signature'}><img src={assetUrl('hero-types/'+hero.category.toLowerCase()+'.webp')} alt="" width={32} height={32}/><span className="hero-type-copy"><strong>{label}</strong></span></span>;
 if(!['Legendary','Mythic','Chosen Hero'].includes(hero.category))return <span className={'hero-kind '+kindClass(hero)}>{label}</span>;
 return <span className={'hero-type-signature '+(hero.blessing?.toLowerCase()||'unblessed')}>
 {hero.blessing&&<img src={blessingIcon(hero.category,hero.blessing,hero)} alt="" width={32} height={32}/>}
 <span className="hero-type-copy"><strong>{label}</strong>{hero.blessing&&<span>{hero.blessing}</span>}</span>
 </span>;
}

export function PoolTag({pool}:{pool:string}){const definitions=useDefinitions();const customIcon=definitionIcon(definitions,'pool',pool);const kind=pool==='Grail Pool'?'grail':pool==='L/M/E Pool'?'lme':pool==='Seasonal Limited'?'special':'general';return <span className={'pool-signature '+kind+(pool==='Non-Seasonal Limited'?' nonseasonal':'')}><img src={customIcon?(customIcon.startsWith('mods-icons/')?heroPortraitUrl(customIcon):assetUrl(customIcon)):assetUrl(kind==='grail'?'hero-types/heroic-grails.webp':'pools/'+kind+'.webp')} alt="" width={24} height={24}/><strong>{pool}</strong></span>;}
