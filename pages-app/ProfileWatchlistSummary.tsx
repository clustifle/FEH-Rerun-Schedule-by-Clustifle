import {useEffect,useState} from 'react';
import {ArrowRight,Bookmark} from 'lucide-react';
import {betaRequest} from './beta';
import {HeroCollection} from './ProfileInterests';
import type {ProfileHero} from './ProfileHeroPicker';
import {upcomingMonth} from './watchlist-model';
import './ProfileWatchlistCard.css';
export default function ProfileWatchlistSummary({heroes}:{heroes:ProfileHero[]}){
 const [rows,setRows]=useState<{hero_id:string;list_name:string}[]|null>(null),[error,setError]=useState(false),[retry,setRetry]=useState(0);
 useEffect(()=>{let alive=true,request=0;async function load(){const current=++request;setError(false);try{const rows=await betaRequest('watchlist');if(alive&&current===request)setRows(rows);}catch{if(alive&&current===request)setError(true);}}void load();window.addEventListener('beta-watchlist-change',load);return()=>{alive=false;window.removeEventListener('beta-watchlist-change',load);};},[retry]);
 const ids=[...new Set(rows?.map(r=>r.hero_id)||[])],upcoming=heroes.filter(h=>ids.includes(h.id)&&upcomingMonth(h.month)).sort((a,b)=>a.month!.localeCompare(b.month!));
 return <section className="profile-watchlist-card" aria-labelledby="profile-watchlist-title"><header><h3 id="profile-watchlist-title"><Bookmark size={22}/>My Watchlist</h3><a className="secondary profile-watchlist-link" href={import.meta.env.BASE_URL+'watchlist'}>Open watchlist<ArrowRight size={16}/></a></header>{error?<p role="alert">Could not load your watchlist. <button className="secondary" onClick={()=>setRetry(n=>n+1)}>Try again</button></p>:<><div className="profile-watchlist-content"><div className="profile-watchlist-total" role="status"><strong>{rows===null?'…':ids.length}</strong><span>Saved heroes</span></div><div className="profile-watchlist-total"><strong>{upcoming.length}</strong><span>Upcoming reruns</span></div><div className="profile-watchlist-total"><strong>{new Set(rows?.map(r=>r.list_name)||[]).size}</strong><span>Collections</span></div></div>{!!upcoming.length&&<><h4>Coming up</h4><HeroCollection ids={upcoming.slice(0,6).map(h=>h.id)} heroes={heroes}/></>}{rows?.length===0&&<p>Add heroes from My Watchlist or a hero profile.</p>}</>}</section>;
}
