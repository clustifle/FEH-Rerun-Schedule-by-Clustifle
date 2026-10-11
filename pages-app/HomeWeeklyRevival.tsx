import {useEffect,useState} from 'react';
import {ArrowRight,CalendarDays} from 'lucide-react';
import {supabase,portraitUrl} from './static-data';
import {goTo,viewUrl} from './routes';
import {bannerTiming} from './banner-time';
import useBannerClock from './useBannerClock';
import {useAutoRefresh} from './useAutoRefresh';
import HeroPortraitMarks,{type PortraitHero} from './HeroPortraitMarks';
import './HomeWeeklyRevival.css';
type Hero=PortraitHero&{id:string;name:string;portrait?:string|null};
type Event={id:string;banner_number:number;starts_on:string;ends_on:string};
type Banner={number:number;hero_1:string|null;hero_2:string|null;hero_3:string|null};
export default function HomeWeeklyRevival({heroes}:{heroes:Hero[]}){
 const [events,setEvents]=useState<Event[]>([]),[banners,setBanners]=useState<Banner[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(false);
 const now=useBannerClock(events.map(e=>({start:Date.parse(e.starts_on+'T07:00:00Z'),end:Date.parse(e.ends_on+'T06:59:59Z')})));
 async function load(){try{const date=new Date().toISOString().slice(0,10);const result=await supabase.from('weekly_revival_events').select('id,banner_number,starts_on,ends_on').eq('confirmed',true).gte('ends_on',date).order('starts_on').limit(30);if(result.error)throw result.error;const rows=result.data||[];const ids=[...new Set(rows.map(e=>e.banner_number))];const catalog=ids.length?await supabase.from('weekly_revival_banners').select('number,hero_1,hero_2,hero_3').in('number',ids):{data:[],error:null};if(catalog.error)throw catalog.error;setEvents(rows);setBanners(catalog.data||[]);setError(false);}catch{setError(true);}finally{setLoading(false);}}
 useEffect(()=>{void load();const refresh=()=>void load();window.addEventListener('revivals-change',refresh);return()=>window.removeEventListener('revivals-change',refresh);},[]);useAutoRefresh(load);
 const available=events.filter(e=>bannerTiming(e.starts_on,e.ends_on,now,'07:00','06:59:59').state!=='Ended');const active=available.filter(e=>bannerTiming(e.starts_on,e.ends_on,now,'07:00','06:59:59').state==='Ongoing');const first=active[0]||available[0];const shown=(active.length?active:available.filter(e=>e.starts_on===first?.starts_on)).slice(0,3);const url=viewUrl('Weekly Revivals',first?.starts_on.slice(0,7)||'');
 const range=first?first.starts_on.slice(5).replace('-','/')+' – '+new Date(Date.parse(first.ends_on+'T12:00:00Z')-86400000).toISOString().slice(5,10).replace('-','/'):'';
 return <article className="home-revival-card home-weekly-card"><a className="home-revival-link home-weekly-link" href={url} onClick={e=>{if(e.button===0&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey){e.preventDefault();goTo(url);}}}><header><span className="home-revival-kind">Weekly Revival</span>{first&&<span className="home-weekly-status">{active.length?'Active this week':'Upcoming'}</span>}</header><h3>{loading?'Loading weekly banners…':error?'Explore Weekly Revivals':first?'Weekly focus lineups':'Weekly Revival schedule'}</h3>{first&&<p className="home-weekly-date"><CalendarDays size={15}/>{range}</p>}<div className="home-weekly-lineups">{shown.map(e=>{const b=banners.find(v=>v.number===e.banner_number);return <div className="home-weekly-lineup" key={e.id}><span>#{e.banner_number}</span><div>{[b?.hero_1,b?.hero_2,b?.hero_3].map((id,i)=>{const h=heroes.find(v=>v.id===id);return <span className="home-weekly-portrait" key={i} title={h?.name}>{h?.portrait?<img src={portraitUrl(h.portrait)} alt={h.name} loading="lazy" decoding="async"/>:<span>{h?.name.slice(0,1)||'—'}</span>}{h&&<HeroPortraitMarks hero={h}/>}</span>;})}</div></div>;})}</div>{!first&&!loading&&<p className="home-weekly-empty">Browse the banner directory and upcoming appearances.</p>}<span className="home-weekly-cta">View Weekly Revivals<ArrowRight size={16}/></span></a></article>;
}
