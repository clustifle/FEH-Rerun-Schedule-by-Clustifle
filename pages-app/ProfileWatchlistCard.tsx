import {useEffect,useState} from 'react';
import {ArrowRight,Bookmark,LockKeyhole} from 'lucide-react';
import {betaRequest} from './beta';
import './ProfileWatchlistCard.css';

export default function ProfileWatchlistCard(){
 const [count,setCount]=useState<number|null>(null),[error,setError]=useState(false),[retry,setRetry]=useState(0);
 useEffect(()=>{let alive=true,request=0;async function load(){const current=++request;setError(false);try{const rows:{hero_id:string}[]=await betaRequest('watchlist');if(alive&&current===request)setCount(new Set(rows.map(row=>row.hero_id)).size);}catch{if(alive&&current===request)setError(true);}}void load();window.addEventListener('beta-watchlist-change',load);return()=>{alive=false;window.removeEventListener('beta-watchlist-change',load);};},[retry]);
 return <section className="profile-watchlist-card" aria-labelledby="profile-watchlist-title"><header><h3 id="profile-watchlist-title"><Bookmark size={22}/>My Watchlist</h3><span className="profile-watchlist-private"><LockKeyhole size={14}/>Only you</span></header><div className="profile-watchlist-content">{error?<div role="alert"><p>Could not load your hero total.</p><button className="secondary" onClick={()=>setRetry(value=>value+1)}>Try again</button></div>:<div className="profile-watchlist-total" role="status"><strong>{count===null?'…':count}</strong><span>{count===null?'Loading your heroes…':count===1?'hero in your watchlist':'heroes in your watchlist'}</span></div>}<p>{count===0?'Start with a hero you want to follow. Add them from their hero profile.':'Your saved heroes, collections, and upcoming reruns in one place.'}</p></div><a className="secondary profile-watchlist-link" href={import.meta.env.BASE_URL+"watchlist"}>Open My Watchlist<ArrowRight size={18}/></a></section>;
}
