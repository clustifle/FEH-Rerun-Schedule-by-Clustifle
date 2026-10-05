import {reduceMotion} from './preferences';
import {useEffect,useRef,useState} from 'react';
import {SlidersHorizontal,X,Search,RotateCcw,ArrowRight,Check} from 'lucide-react';
import {assetUrl} from './static-data';
import {pools} from './hero-pools';
import './AdvancedFilters.css';

type Props={categories:string[];type:string;color:string;pool:string;search:string;matches:number;onType:(value:string)=>void;onColor:(value:string)=>void;onPool:(value:string)=>void;onSearch:(value:string)=>void;onReset:()=>void};
export default function AdvancedFilters(p:Props){
 const dialog=useRef<HTMLDialogElement>(null),body=useRef<HTMLDivElement>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const [open,setOpen]=useState(false),[closing,setClosing]=useState(false);
 const active=Number(p.type!=='All heroes')+Number(p.color!=='All')+Number(p.pool!=='All')+Number(Boolean(p.search));
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 useEffect(()=>{if(!open)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous;};},[open]);
 function close(){
  if(closing)return;
  setClosing(true);
  timer.current=setTimeout(()=>{dialog.current?.close();setClosing(false);},reduceMotion()?0:180);
 }
 return <>
  <button aria-label="Filters" title="Filters" className={'filter-launch toolbar-icon'+(active?' has-filters':'')} aria-haspopup="dialog" aria-expanded={open} onClick={()=>{setClosing(false);setOpen(true);dialog.current?.showModal();if(body.current)body.current.scrollTop=0;}}><SlidersHorizontal size={17}/>{active>0&&<span className="filter-active-count" aria-label={active+' active filters'}>{active}</span>}</button>
  <dialog ref={dialog} className={'filter-sheet'+(closing?' is-closing':'')} aria-labelledby="advanced-filter-title" onClose={()=>setOpen(false)} onCancel={e=>{e.preventDefault();close();}} onClick={e=>{if(e.target===dialog.current){const rect=dialog.current.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)close();}}}>
   <header className="filter-sheet-header"><div className="filter-sheet-emblem" aria-hidden="true"><SlidersHorizontal size={22}/></div><div><h2 id="advanced-filter-title">Filters</h2><p>Find the heroes you’re looking for.</p></div><button className="filter-close" aria-label="Close filters" onClick={close} autoFocus><X size={21}/></button></header>
   <div className="filter-sheet-body" ref={body}>
    <label className="filter-search"><Search size={18} aria-hidden="true"/><input type="search" aria-label="Search heroes in filters" placeholder="Search hero name or title" value={p.search} onChange={e=>p.onSearch(e.target.value)}/></label>
    <section className="filter-section"><h3>Hero type</h3><select aria-label="Hero type" value={p.type} onChange={e=>p.onType(e.target.value)}>{['All heroes',...p.categories].map(type=><option key={type} value={type}>{type==='Chosen Hero'?'Chosen':type}</option>)}</select></section>
    <section className="filter-section"><h3 id="filter-colors-title">Weapon color</h3><div className="filter-color-options" role="group" aria-labelledby="filter-colors-title">{['All','Red','Blue','Green','Colorless'].map(color=><button key={color} className={'filter-color-choice '+color.toLowerCase()} aria-pressed={p.color===color} onClick={()=>p.onColor(color)}><img className="filter-weapon-orb" src={assetUrl('weapon-orbs/'+(color==='All'?'any':color.toLowerCase())+'.webp')} alt="" width={26} height={26}/><span>{color==='All'?'Any':color}</span></button>)}</div></section>
    <section className="filter-section"><h3 id="filter-pools-title">Summoning pool</h3><div className="filter-pool-options" role="group" aria-labelledby="filter-pools-title">{['All',...pools].map(pool=>{const icon=pool==='L/M/E Pool'?'lme':pool==='Seasonal Limited'?'special':'general';return <button key={pool} className={'filter-pool-choice'+(pool==='All'?' any-pool':'')} aria-pressed={p.pool===pool} onClick={()=>p.onPool(pool)}>{pool==='All'?<span className="filter-pool-any" aria-hidden="true">◇</span>:<img src={assetUrl('pools/'+icon+'.webp')} alt=""/>}<span><strong>{pool==='All'?'Any pool':pool}</strong><small>{pool==='All'?'Include every summoning pool':pool==='General Pool'?'Regular summoning pool':pool==='Non-Seasonal Limited'?'Limited heroes without a seasonal theme':pool==='Seasonal Limited'?'Seasonal Special Heroes': 'Legendary, Mythic & Emblem'}</small></span><span className="filter-choice-check" aria-hidden="true">{p.pool===pool&&<Check size={15}/>}</span></button>;})}</div></section>
   </div>
   <footer className="filter-sheet-footer"><p role="status"><strong>{p.matches}</strong> {p.matches===1?'hero matches':'heroes match'}</p><div><button className="filter-reset" onClick={p.onReset} disabled={!active}><RotateCcw size={15}/>Reset</button><button className="filter-show" onClick={close}>Show heroes<ArrowRight size={16}/></button></div></footer>
  </dialog>
 </>;
}
