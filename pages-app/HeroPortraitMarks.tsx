import {assetUrl} from './static-data';
export type PortraitHero={color:string;heroic_grail?:boolean;category?:string;blessing?:string|null;weapon_type?:string|null;move_type?:string|null};
export default function HeroPortraitMarks({hero}:{hero:PortraitHero}){
 const type=hero.heroic_grail?'Heroic Grails':hero.category||'';const hasType=!['','General','Special'].includes(type);
 const typeIcon=hero.heroic_grail?assetUrl('hero-types/heroic-grails.webp'):['Legendary','Mythic','Chosen Hero'].includes(type)?(hero.blessing?assetUrl((type==='Chosen Hero'?'chosen/':'blessings/')+hero.blessing.toLowerCase()+(type==='Chosen Hero'?'.png':'.webp')):null):hasType?assetUrl('hero-types/'+type.toLowerCase()+'.webp'):null;
 const color=['red','blue','green','colorless'].includes(hero.color.toLowerCase())?hero.color.toLowerCase():'colorless';
 return <span className="portrait-marks" aria-hidden="true"><span className={'hero-portrait-frame frame-'+color} data-frame-color={color}/>{hero.weapon_type&&<img className="portrait-mark weapon-mark" src={assetUrl('weapon-types/'+hero.color.toLowerCase()+'-'+hero.weapon_type.toLowerCase()+'.webp')} alt="" title={hero.color+' '+hero.weapon_type}/>} {typeIcon&&<img className="portrait-mark type-mark" src={typeIcon} alt="" title={type+(hero.blessing?' · '+hero.blessing:'')}/>} {hero.move_type&&<img className="portrait-mark move-mark" src={assetUrl('move-types/'+hero.move_type.toLowerCase()+'.webp')} alt="" title={hero.move_type}/>}</span>;
}
