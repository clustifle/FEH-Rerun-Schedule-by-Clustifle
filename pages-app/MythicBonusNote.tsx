import {mythicBonus,mythicBonusNotes,type BlessingHero} from './blessing-icons';
export default function MythicBonusNote({hero}:{hero:BlessingHero}){
 if(hero.category!=='Mythic')return null;const bonus=mythicBonus(hero);
 return <details className="mythic-bonus-note"><summary>{bonus?'Mythic Bonus '+bonus:'Mythic bonus · debut information needed'}</summary>{bonus&&<p>{mythicBonusNotes[bonus]}</p>}<ul><li><strong>Bonus 1 · v3.0.0–before v5.0.0:</strong> Ally Boost, introduced with Eir: Merciful Death.</li><li><strong>Bonus 2 · v5.0.0–before v9.0.0:</strong> Ally Boost and an additional Aether Raids team slot, introduced with Reginn: Bearing Hope.</li><li><strong>Bonus 3 · v9.0.0 onward:</strong> Also enables a reinforcement slot from turn 3 with a Calling Circle, introduced with Rune: Source of Wisdom.</li></ul><a href="https://feheroes.fandom.com/wiki/Mythic_Heroes" target="_blank" rel="noopener noreferrer">Mythic Heroes · FEH Wiki</a></details>;
}
