import {useEffect,useRef} from 'react';
import {Pencil,Plus,Users,ChevronDown} from 'lucide-react';
export default function WaitlistEditMenu({busy,onAdd,onChoose}:{busy:boolean;onAdd:()=>void;onChoose:()=>void}){
 const menu=useRef<HTMLDetailsElement>(null);
 useEffect(()=>{const outside=(e:PointerEvent)=>{if(!menu.current?.contains(e.target as Node)&&menu.current)menu.current.open=false;};const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'&&menu.current?.open){menu.current.open=false;menu.current.querySelector('summary')?.focus();}};document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};},[]);
 function choose(action:()=>void){if(busy)return;if(menu.current)menu.current.open=false;action();}
 return <details className="waitlist-edit-menu" ref={menu}><summary className="primary schedule-add-hero" onClick={e=>{if(busy)e.preventDefault();}} aria-disabled={busy}><Pencil size={18}/>Edit<ChevronDown size={16}/></summary><div className="waitlist-edit-options"><button disabled={busy} onClick={()=>choose(onAdd)}><Plus size={18}/><span>Add Hero<small>Create a new hero</small></span></button><button disabled={busy} onClick={()=>choose(onChoose)}><Users size={18}/><span>Choose a Hero<small>Add from the saved roster</small></span></button></div></details>;
}
