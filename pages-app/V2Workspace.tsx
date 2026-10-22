import HeroPortraitMarks from './HeroPortraitMarks';
import MyWatchlist from './MyWatchlist';
import ToolBoundary from './ToolBoundary';
import {Grid2X2,List,LayoutGrid,Shield} from 'lucide-react';
import {useEffect,useMemo,useState,lazy} from 'react';
import {betaRequest} from './beta';
import {assetUrl,portraitUrl,supabase} from './static-data';
import {useVersions,loadVersions} from './VersionSelect';
import VersionSelect from './VersionSelect';
import {weaponTypes,allWeaponTypes} from './weapon-types';
import {moveTypes} from './move-types';
import {baseTypes,basePools} from './catalog';
import {heroUrl} from './routes';
import './V2Workspace.css';
const BulkEditor=lazy(()=>import('./BulkEditor'));
const VersionsManagement=lazy(()=>import('./VersionsManagement'));
const Community=lazy(()=>import('./Community'));
export type BetaHero={id:string;name:string;title:string;category:string;color:string;portrait:string|null;pool:string|null;schedule:string;month:string|null;notes:string;revision?:number;weapon_type?:string|null;move_type?:string|null;blessing?:string|null;demote?:boolean;heroic_grail?:boolean;debut_version?:string|null;release_date?:string|null;release_event?:string|null};
type Props<T extends BetaHero>={section:string;heroes:T[];onView:(hero:T)=>void;onRefresh:()=>Promise<void>};
const sections=[['My Watchlist','watchlist'],['Forum','community'],['Administrative Manager','FEHRS_AdmManager/']] as const;
export function BetaNavigation(){return <aside className="beta-navigation"><p><strong>2.0 Beta · Head Admin testing</strong><span>Hero changes stay in the beta database. Other live editing is disabled.</span></p><nav aria-label="Version 2.0 beta tools">{sections.map(([label,path])=><a key={path} href={'/'+path}>{label}</a>)}</nav></aside>;}
const errorMessage=(e:unknown)=>e instanceof Error?e.message:'Could not complete the request.';
const title=(hero:BetaHero)=>hero.name+' — '+hero.title;
function HeroRows<T extends BetaHero>({heroes,onView}:{heroes:T[];onView:(h:T)=>void}){const [limit,setLimit]=useState(60);return <><ul className="v2-hero-list">{heroes.slice(0,limit).map(h=><li key={h.id}><button data-hero-preview-id={h.id} onClick={()=>onView(h)}><span className="shared-hero-portrait">{h.portrait&&<img src={portraitUrl(h.portrait)} alt="" loading="lazy"/>}<HeroPortraitMarks hero={h}/></span><span><strong>{h.name}</strong><small>{h.title}</small><small>{h.debut_version?'FEH '+h.debut_version:'Version not recorded'}</small></span></button></li>)}</ul>{heroes.length>limit&&<button className="secondary" onClick={()=>setLimit(v=>v+60)}>Show more</button>}{!heroes.length&&<p>No heroes match this selection.</p>}</>;}
export default function V2Workspace<T extends BetaHero>(p:Props<T>){
 const titleMap:Record<string,string>={'watchlist':'My Watchlist','community':'Forum','bulk':'Bulk Edit Heroes','manage-versions':'Manage FEH Versions','beta-history':'Beta Change History'};
 return <section className="v2-workspace"><header className="fb-heading"><h2>{titleMap[p.section]||'Version 2.0'}</h2></header><ToolBoundary key={p.section}>{p.section==='watchlist'?<MyWatchlist {...p}/>:p.section==='bulk'?<BulkEditor {...p}/>:p.section==='manage-versions'?<VersionsManagement onRefresh={p.onRefresh}/>:p.section==='beta-history'?<BetaHistory/>:<Community/>}</ToolBoundary></section>;
}
type Follow={hero_id:string;list_name:string};
export function BetaHistory(){const [rows,setRows]=useState<{id:string;label:string;created_at:string;before_json:string;after_json:string}[]>([]),[error,setError]=useState('');useEffect(()=>{void betaRequest('history').then(setRows).catch(e=>setError(errorMessage(e)));},[]);return <><p>Changes made to isolated beta hero records. This is an editing log, not historical rerun data.</p><ul className="v2-simple-list">{rows.map(r=><li key={r.id}><details><summary>{r.label} · {new Date(r.created_at).toLocaleString()}</summary><pre>{JSON.stringify({before:JSON.parse(r.before_json),after:JSON.parse(r.after_json)},null,2)}</pre></details></li>)}</ul>{!rows.length&&!error&&<p>No beta changes recorded.</p>}{error&&<p className="error" role="alert">{error}</p>}</>;}
export function HeroWatchlist({hero}:{hero:BetaHero}){
 const [following,setFollowing]=useState(false),[watchReady,setWatchReady]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [accountId,setAccountId]=useState('');
 useEffect(()=>{let alive=true,request=0;async function load(){const current=++request;setFollowing(false);setWatchReady(false);setAccountId('');setError('');try{const {data:{session}}=await supabase.auth.getSession();const owner=session?.user.id||'';const follows:Follow[]=owner?await betaRequest('watchlist'):[];if(alive&&current===request){setAccountId(owner);setFollowing(follows.some(f=>f.hero_id===hero.id));setWatchReady(true);}}catch(e){if(alive&&current===request)setError(errorMessage(e));}}void load();window.addEventListener('owner-session-change',load);window.addEventListener('beta-watchlist-change',load);return()=>{alive=false;request++;window.removeEventListener('owner-session-change',load);window.removeEventListener('beta-watchlist-change',load);};},[hero.id]);
 async function follow(){if(!accountId){window.dispatchEvent(new Event('open-owner-login'));return;}setBusy(true);setError('');try{await betaRequest('watchlist',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({hero_id:hero.id,list_name:'Following',follow:!following,account_id:accountId})});setFollowing(!following);window.dispatchEvent(new Event('beta-watchlist-change'));}catch(e){setError(errorMessage(e));}finally{setBusy(false);}}

 return <div className="hero-overview-watchlist"><div className="v2-actions"><button className="secondary" disabled={busy||!watchReady} aria-pressed={following} onClick={()=>void follow()}>{!watchReady?'Loading watchlist…':busy?'Saving…':following?'Remove from my watchlist':'Add to my watchlist'}</button><a className="secondary" href={import.meta.env.BASE_URL+"watchlist"}>My Watchlist</a></div>{error&&<p className="error" role="alert">{error}</p>}</div>;
}
export function V2HeroInfo({hero,heroes=[]}:{hero:BetaHero;heroes?:BetaHero[];compact?:boolean}){
 const variants=heroes.filter(h=>h.id!==hero.id&&h.name===hero.name);
 if(!variants.length)return null;
 return <section className="hero-profile-card hero-profile-variants" aria-labelledby="other-variants-heading"><header className="hero-profile-card-heading"><h2 id="other-variants-heading">Other variants</h2></header><div className="hero-variant-grid">{variants.map(h=><a className="hero-variant-link" key={h.id} href={heroUrl(h,heroes)} title={h.name+' · '+(h.title||h.category)} aria-label={'View '+h.name+' · '+(h.title||h.category)}><span className="hero-variant-portrait">{h.portrait?<img src={portraitUrl(h.portrait)} alt="" loading="lazy" decoding="async"/>:<Shield size={32}/>}<HeroPortraitMarks hero={h}/></span></a>)}</div></section>;
}
