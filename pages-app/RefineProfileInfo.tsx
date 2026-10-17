import {useRefineProfileData} from './refine-data';
import {refineHeroKey} from '../lib/refine-board';
import {goTo,viewUrl} from './routes';
export default function RefineProfileInfo({hero}:{hero:{id:string;name:string;title:string}}){
 const data=useRefineProfileData(),key=refineHeroKey(hero.name,hero.title),rows=data.entries.filter(e=>e.heroId===hero.id||refineHeroKey(e.name,e.title)===key);
 const entry=rows.find(e=>e.status==='predicted'||e.status==='announced')||rows.filter(e=>e.status==='released').sort((a,b)=>(b.month||'').localeCompare(a.month||''))[0]||rows[0];
 if(!entry)return null;
 const status=({predicted:'Predicted',alternative:'Alternative',announced:'Announced',released:'Released',waiting:'Unscheduled',uncertain:'Skipped / uncertain'})[entry.status];
 return <div className="refine-profile-link"><span>Weapon refinement</span><a href={viewUrl('Refine Predictions')} onClick={e=>{if(!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey){e.preventDefault();goTo(viewUrl('Refine Predictions'))}}}>{status}{entry.month?' · '+new Date(entry.month+'-01T00:00:00Z').toLocaleDateString('en-US',{month:'short',year:'numeric',timeZone:'UTC'}):''}</a></div>;
}
