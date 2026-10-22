import {assetUrl} from './static-data';
import {heroOrigin,originGames} from './hero-origins';
export default function HeroOriginIcons({hero}:{hero:{id:string;name:string;title:string}}){
 const games=[...new Set(heroOrigin(hero)?.origins||[])].map(id=>originGames[id]).filter(Boolean);
 if(!games.length)return null;
 return <span className="directory-origin-icons" role="img" aria-label={'Origin: '+games.map(g=>g.name).join(' and ')} title={games.map(g=>g.name).join(' · ')}>{games.map(game=><img key={game.id} src={assetUrl('images/game-origins/'+game.file)} alt="" loading="lazy" decoding="async"/>)}</span>;
}
