import HeroOriginIcons from './HeroOriginIcons';
import {heroOrigin,heroOriginNames,originGames,compareGameOrder} from './hero-origins';
import {usePoolRangeSettings} from './pool-range-settings';
import {isBeta,versionMatches} from './beta';
import VersionSelect from './VersionSelect';
import {useDefinitions,definitionNames} from './catalog';
import HeroPortraitMarks from './HeroPortraitMarks';
import AdvancedFilters from './AdvancedFilters';
import {useMemo,useState,useRef,useEffect,useDeferredValue,useCallback,useLayoutEffect} from 'react';
import {Plus,Search,Shield,X,RotateCcw} from 'lucide-react';
import {portraitUrl} from './static-data';
import {displayPool} from './hero-pools';
import './AllHeroes.css';
import {searchKey,directorySearchText,rerunMonth,rerunLabel,compareRecorded} from './directory-data';
import {resourceBudget} from './resource-budget';
type Hero={debut_version?:string|null;release_date?:string|null;id:string;name:string;title:string;category:string;heroic_grail?:boolean;demote?:boolean;pool?:string|null;schedule?:string;month?:string|null;updated?:string;blessing?:string|null;color:string;portrait:string|null;weapon_type?:string|null;move_type?:string|null;searchText?:string;notes?:string};
const sortFields={title:'title',type:'category',weapon:'weapon_type',movement:'move_type'} as const;
const colorRanks=['Red','Blue','Green','Colorless'];
const collator=new Intl.Collator('en',{sensitivity:'base',numeric:true});
const scheduleName=(s:string)=>({'Weekly Revival':'Weekly Revival','Schedule Under Consideration':'Schedule Under Consideration','General':'General Schedule','Remix':'Remix Schedule','Monthly Revival':'L/M Revival','Forging Bonds Revival':'NH Revival','Hall of Forms Revival':'HoF Revival','Waitlist':'L/M/E Waitlist','DSH Waitlist':'DSH Waitlist','NHR Waitlist':'NHR Waitlist','Remix Waitlist':'Remix Waitlist'} as Record<string,string>)[s]||'Unscheduled';
const monthFormatter=new Intl.DateTimeFormat('en',{month:'short',year:'numeric',timeZone:'UTC'});
const monthName=(month?:string|null)=>month&&/^\d{4}-\d{2}/.test(month)?monthFormatter.format(new Date(month.slice(0,7)+'-01T00:00:00Z')):'Not recorded';
const sortOptions=[['game','Game order · Catalog'],['name-asc','Name · A–Z'],['name-desc','Name · Z–A'],['title','Hero title'],['type','Hero type'],['color','Weapon color'],['weapon','Weapon type'],['movement','Movement type'],['month-asc','Rerun · earliest'],['month-desc','Rerun · latest'],['release-desc','Release · newest'],['release-asc','Release · oldest'],['version-desc','Debut version · newest'],['version-asc','Debut version · oldest'],['updated','Recently updated']];
const viewOptions=[['small','Small icons'],['medium','Medium icons'],['large','Large icons'],['list','List'],['details','Details'],['tiles','Tiles'],['content','Content']];
export default function AllHeroes<T extends Hero>({heroes,onView,canEdit,onAdd}:{heroes:T[];onView:(hero:T)=>void;canEdit:boolean;onAdd:()=>void}){
 const onViewRef=useRef(onView);useLayoutEffect(()=>{onViewRef.current=onView;},[onView]);
 const openHero=useCallback((hero:T)=>onViewRef.current(hero),[]);
 const [version,setVersion]=useState('All');
 const [origin,setOrigin]=useState('All');
 const [sort,setSort]=useState('release-desc'),[view,setView]=useState(()=>{try{const saved=localStorage.getItem('feh-all-heroes-view');return viewOptions.some(([key])=>key===saved)?saved!:'medium';}catch{return 'medium';}}),[search,setSearch]=useState('');
 const [type,setType]=useState('All heroes'),[color,setColor]=useState('All'),[weapon,setWeapon]=useState('All'),[move,setMove]=useState('All'),[pool,setPool]=useState('All'),[showGrails,setShowGrails]=useState(true),[schedule,setSchedule]=useState('All'),[blessing,setBlessing]=useState('All'),[demote,setDemote]=useState('All');
 const results=useRef<HTMLDivElement>(null);
 const [budget]=useState(resourceBudget),[pageIndex,setPageIndex]=useState(0);
 const definitions=useDefinitions();
 const poolRanges=usePoolRangeSettings();
 const categories=useMemo(()=>definitionNames(definitions,'hero_type',heroes.map(h=>h.category)),[definitions,heroes]);
 const schedules=useMemo(()=>Array.from(new Set(heroes.map(h=>h.schedule||'None'))).sort((a,b)=>collator.compare(scheduleName(a),scheduleName(b))),[heroes]);
 const blessings=useMemo(()=>Array.from(new Set(heroes.map(h=>h.blessing).filter((s):s is string=>Boolean(s)))).sort(collator.compare),[heroes]);
 const query=searchKey(useDeferredValue(search).trim());
 const searchIndex=useMemo(()=>new Map(heroes.map(h=>[h.id,directorySearchText(h,displayPool(h))+' '+searchKey(heroOriginNames(h))])),[heroes,poolRanges]);
 const queryWords=useMemo(()=>query.split(/\s+/).filter(Boolean),[query]);
 const sortedHeroes=useMemo(()=>[...heroes].sort((a,b)=>{
 const names=collator.compare(a.name,b.name)||collator.compare(a.title,b.title)||a.id.localeCompare(b.id);
 if(sort==='game')return compareGameOrder(a,b)||names;
 if(sort==='name-desc')return -names;
 if(sort.startsWith('month-')){const am=rerunMonth(a),bm=rerunMonth(b);if(!am||!bm)return am?-1:bm?1:names;return (sort==='month-desc'?-1:1)*collator.compare(am,bm)||names;}
 if(sort.startsWith('release-')||sort.startsWith('version-')){const field=sort.startsWith('release-')?'release_date':'debut_version';return compareRecorded(a[field],b[field],sort.endsWith('desc'),collator.compare)||names;}
 if(sort==='updated')return collator.compare(b.updated||'',a.updated||'')||names;
 if(sort==='color')return colorRanks.indexOf(a.color)-colorRanks.indexOf(b.color)||names;
 const field=sortFields[sort as 'title'|'type'|'weapon'|'movement'];
 return field?collator.compare(a[field]||'',b[field]||'')||names:names;
 }),[heroes,sort]);
 const rows=useMemo(()=>sortedHeroes.filter(h=>{
 const text=searchIndex.get(h.id)||'';
 return (origin==='All'||(origin==='Unknown'?!heroOrigin(h):heroOrigin(h)?.origins.includes(Number(origin))))&&versionMatches(h.debut_version,version)&&queryWords.every(word=>text.includes(word))&&(type==='All heroes'||h.category===type)&&(color==='All'||h.color===color)&&(pool==='All'||displayPool(h)===pool)&&(showGrails||!h.heroic_grail)&&(weapon==='All'||(weapon==='Unassigned'?!h.weapon_type:h.weapon_type===weapon))&&(move==='All'||(move==='Unassigned'?!h.move_type:h.move_type===move))&&(schedule==='All'||(h.schedule||'None')===schedule)&&(blessing==='All'||(blessing==='Unassigned'?!h.blessing:h.blessing===blessing))&&(demote==='All'||Boolean(h.demote)===(demote==='Yes'));
 }),[sortedHeroes,searchIndex,queryWords,origin,type,color,pool,showGrails,weapon,move,schedule,blessing,demote,version,poolRanges]);
 const pageCount=Math.max(1,Math.ceil(rows.length/budget.batchSize)),currentPage=Math.min(pageIndex,pageCount-1);
 const offset=currentPage*budget.batchSize;
 const visibleRows=useMemo(()=>rows.slice(offset,offset+budget.batchSize),[rows,offset,budget.batchSize]);
 function changePage(next:number){setPageIndex(next);if(results.current)results.current.scrollTop=0;window.dispatchEvent(new Event('hero-preview-dismiss'));}
 useEffect(()=>{setPageIndex(0);if(results.current)results.current.scrollTop=0;},[query,origin,type,color,pool,showGrails,weapon,move,schedule,blessing,demote,sort,view,version]);
 useEffect(()=>{try{localStorage.setItem('feh-all-heroes-view',view);}catch{}},[view]);
 function reset(){setOrigin('All');setVersion('All');setSearch('');setType('All heroes');setColor('All');setWeapon('All');setMove('All');setPool('All');setShowGrails(true);setSchedule('All');setBlessing('All');setDemote('All');}
 const chips:[string,()=>void][]=[];
 if(origin!=='All')chips.push(['Origin: '+(originGames[Number(origin)]?.name||'Not recorded'),()=>setOrigin('All')]);
 if(version!=='All')chips.push(['Version: '+version,()=>setVersion('All')]);
 if(query)chips.push(['Search: '+search,()=>setSearch('')]);if(type!=='All heroes')chips.push([type,()=>setType('All heroes')]);if(color!=='All')chips.push([color,()=>setColor('All')]);if(weapon!=='All')chips.push(['Weapon: '+weapon,()=>setWeapon('All')]);if(move!=='All')chips.push(['Movement: '+move,()=>setMove('All')]);if(pool!=='All')chips.push([pool,()=>setPool('All')]);if(!showGrails)chips.push(['Grails hidden',()=>setShowGrails(true)]);if(schedule!=='All')chips.push([scheduleName(schedule),()=>setSchedule('All')]);if(blessing!=='All')chips.push(['Blessing: '+blessing,()=>setBlessing('All')]);if(demote!=='All')chips.push([demote==='Yes'?'Demotes only':'Demotes hidden',()=>setDemote('All')]);
 const portrait=useCallback((h:T)=><span className="all-heroes-portrait">{h.portrait?<img src={portraitUrl(h.portrait)} alt="" loading="lazy" decoding="async"/>:<Shield size={28}/>}<HeroPortraitMarks hero={h}/></span>,[]);
 const renderedRows=useMemo(()=>view==='details'&&visibleRows.length>0?<table className="directory-table"><thead><tr><th>Hero</th><th>Origin</th><th>Type / pool</th><th>Weapon / movement</th><th>Schedule</th><th>Rerun month</th></tr></thead><tbody>{visibleRows.map(h=><tr key={h.id}><td><button className="directory-table-hero" onClick={()=>openHero(h)}>{portrait(h)}<span><strong>{h.name}</strong><span>{h.title||'Untitled hero'}</span><HeroOriginIcons hero={h}/></span></button></td><td>{heroOriginNames(h)||'Not recorded'}</td><td>{h.category}<small>{displayPool(h)}{h.heroic_grail?' · Heroic Grails':''}</small></td><td>{h.color} {h.weapon_type||'weapon unassigned'}<small>{h.move_type||'Movement unassigned'}</small></td><td>{scheduleName(h.schedule||'None')}</td><td>{rerunLabel(h)||monthName(rerunMonth(h))}</td></tr>)}</tbody></table>:visibleRows.map(h=><button key={h.id} className={'all-heroes-card '+h.color.toLowerCase()} onClick={()=>openHero(h)} aria-label={'View '+h.name+' · '+h.title}>{portrait(h)}<span className="all-heroes-copy"><strong>{h.name}</strong><span>{h.title||'Untitled hero'}</span><HeroOriginIcons hero={h}/>{['large','tiles','content'].includes(view)&&<span className="directory-hero-type">{h.category==='Chosen Hero'?'Chosen':h.category}{h.heroic_grail?' · Heroic Grails':''}</span>}</span>{view==='content'&&<span className="directory-content-facts"><span>{displayPool(h)}</span><span>{h.color} {h.weapon_type||'Weapon not assigned'} · {h.move_type||'Movement not assigned'}</span><span>Version {h.debut_version||'not recorded'}</span></span>}{['tiles','content'].includes(view)&&h.schedule&&h.schedule!=='None'&&<span className="directory-rerun"><span>{scheduleName(h.schedule||'None')}</span><strong>{rerunLabel(h)||monthName(rerunMonth(h))}</strong></span>}</button>),[view,visibleRows,openHero,portrait,poolRanges]);
 const extra=(label:string,value:string,change:(s:string)=>void,options:[string,string][])=><section className="filter-section"><h3>{label}</h3><select aria-label={label} value={value} onChange={e=>change(e.target.value)}>{options.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></section>;
 return <section className="all-heroes directory-workspace" aria-label="All Heroes directory">
 <div className="all-heroes-tools directory-toolbar"><label className="all-heroes-search"><Search size={19}/><input type="search" aria-label="Search all heroes" placeholder="Search name, title, weapon, movement, version…" value={search} onChange={e=>setSearch(e.target.value)}/></label><label className="directory-toolbar-select"><span>Sort</span><select aria-label="Sort heroes" value={sort} onChange={e=>setSort(e.target.value)}>{sortOptions.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label className="directory-toolbar-select"><span>View</span><select aria-label="Hero directory view" value={view} onChange={e=>setView(e.target.value)}>{viewOptions.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><div className="directory-filter-control"><AdvancedFilters {...{showGrails,move,weapon,categories,type,color,pool,search}} matches={rows.length} onShowGrails={setShowGrails} onMove={setMove} onWeapon={setWeapon} onType={setType} onColor={setColor} onPool={setPool} onSearch={setSearch} onReset={reset} extraActive={Number(origin!=='All')+Number(version!=='All')+Number(schedule!=='All')+Number(blessing!=='All')+Number(demote!=='All')}>{<section className="filter-section"><VersionSelect filter value={version} onChange={setVersion}/></section>}{extra('Game origin',origin,setOrigin,[['All','All games'],...originGames.map(g=>[String(g.id),g.name] as [string,string]),['Unknown','Not recorded']])}{extra('Schedule',schedule,setSchedule,[['All','Any schedule'],...schedules.map(s=>[s,scheduleName(s)] as [string,string])])}{extra('Blessing',blessing,setBlessing,[['All','Any blessing'],['Unassigned','Not assigned'],...blessings.map(s=>[s,s] as [string,string])])}{extra('Demote status',demote,setDemote,[['All','All heroes'],['Yes','Demotes only'],['No','Hide demotes']])}</AdvancedFilters></div>{canEdit&&<button className="secondary directory-add" aria-label="Add hero" title="Add hero" onClick={onAdd}><Plus size={16}/><span>Add hero</span></button>}</div><p className="directory-total" role="status">{rows.length} of {heroes.length} heroes</p>

 {chips.length>0&&<div className="directory-filter-chips" aria-label="Active filters">{chips.map(([label,clear])=><button key={label} onClick={clear} aria-label={'Remove filter '+label}>{label}<X size={14}/></button>)}<button onClick={reset}><RotateCcw size={14}/>Clear all</button></div>}
 <div ref={results} className={'all-heroes-results '+view+'-view'} aria-busy={searchKey(search.trim())!==query} tabIndex={0} aria-label="Hero results; scroll to browse">
 {renderedRows}
 {!rows.length&&<div className="all-heroes-empty"><Shield size={30}/><h3>{heroes.length?'No matching heroes':'No heroes yet'}</h3><p>{heroes.length?'Try another search or clear your filters.':'Heroes will appear here when they are added.'}</p>{chips.length>0&&<button className="secondary" onClick={reset}>Clear filters</button>}</div>}</div>{rows.length>budget.batchSize&&<nav className="directory-page-controls" aria-label="Hero result pages"><button className="secondary" disabled={currentPage===0} onClick={()=>changePage(currentPage-1)}>Previous</button><p>{offset+1}–{Math.min(offset+budget.batchSize,rows.length)} of {rows.length}</p><button className="secondary" disabled={currentPage===pageCount-1} onClick={()=>changePage(currentPage+1)}>Next</button></nav>}</section>;
}
