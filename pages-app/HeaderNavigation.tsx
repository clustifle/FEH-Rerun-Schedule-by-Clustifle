import {useEffect,useRef} from 'react';
import {ChevronDown,UserRound} from 'lucide-react';
import {viewUrl} from './routes';
import {waitlistViews,waitlistLabel} from './waitlist-types';
import './HeaderNavigation.css';
const schedules=[['General','L/M/E Schedule'],['Remix','Remix Schedule'],['Monthly Revival','Monthly Legendary/Mythic Revival'],['Weekly Revivals','Weekly Revival'],['Forging Bonds Revival','New Heroes Revival'],['Hall of Forms Revival','Hall of Forms Revival'],['Schedule Under Consideration','Schedule Under Consideration']];
export default function HeaderNavigation({active,disabled,onNavigate,profileSlug=''}:{active:string;disabled:boolean;onNavigate:(view:string)=>void;profileSlug?:string}){
 const root=useRef<HTMLElement>(null);
 const close=()=>root.current?.querySelectorAll<HTMLDetailsElement>('details[open]').forEach(d=>{d.open=false;});
 useEffect(()=>{
  const outside=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node))close();};
  const escape=(e:KeyboardEvent)=>{if(e.key!=='Escape')return;const open=root.current?.querySelector<HTMLDetailsElement>('details[open]');if(open){open.open=false;open.querySelector<HTMLElement>('summary')?.focus();}};
  document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
 },[]);
 useEffect(()=>{
  const header=root.current?.closest<HTMLElement>('.masthead');if(!header)return;
  let frame=0,innerScroll=0;
  const update=(e?:Event)=>{if(e?.target instanceof HTMLElement&&e.target.matches('.all-heroes-results'))innerScroll=e.target.scrollTop;if(frame)return;frame=requestAnimationFrame(()=>{frame=0;const distance=Math.max(window.scrollY,innerScroll),compact=header.classList.contains('is-compact');if(!compact&&distance>96)header.classList.add('is-compact');else if(compact&&distance<40)header.classList.remove('is-compact');});};
  const route=()=>{innerScroll=0;update();};document.addEventListener('scroll',update,{capture:true,passive:true});window.addEventListener('route-change',route);update();
  return()=>{cancelAnimationFrame(frame);document.removeEventListener('scroll',update,true);window.removeEventListener('route-change',route);header.classList.remove('is-compact');};
 },[active]);
 useEffect(close,[active]);
 const link=(view:string,label:string)=> <a key={view} href={viewUrl(view,'',view==='Profile'?profileSlug:'')} aria-current={active===view?'page':undefined} aria-disabled={disabled||undefined} tabIndex={disabled?-1:undefined} onClick={e=>{if(disabled){e.preventDefault();return;}if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();close();onNavigate(view);}}>{label}</a>;
 const dropdown=(label:string,items:string[][])=><details className="header-navigation-dropdown" onToggle={e=>{const current=e.currentTarget;if(current.open)root.current?.querySelectorAll<HTMLDetailsElement>('details').forEach(d=>{if(d!==current)d.open=false;});}}><summary aria-disabled={disabled||undefined} onClick={e=>{if(disabled)e.preventDefault();}} className={items.some(([view])=>view===active)?'is-active':undefined}>{label}<ChevronDown size={13}/></summary><div className="header-navigation-options">{items.map(([view,name])=>link(view,name))}</div></details>;
 return <><nav ref={root} className="header-primary-navigation" aria-label="Primary navigation">{link('Homepage','Home')}{dropdown('Schedule',schedules)}{dropdown('Waitlist',waitlistViews.map(view=>[view,waitlistLabel(view)]))}{link('All Heroes','All Heroes')}{link('Community','Forum')}</nav><a className="header-profile-link" href={viewUrl('Profile','',profileSlug)} aria-label="Profile" title="Profile" aria-disabled={disabled||undefined} tabIndex={disabled?-1:undefined} aria-current={active==='Profile'?'page':undefined} onClick={e=>{if(disabled){e.preventDefault();return;}if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();close();onNavigate('Profile');}}><UserRound size={21}/></a></>;
}
