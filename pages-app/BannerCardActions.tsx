import {useEffect,useRef} from 'react';
import {Ellipsis,Pencil,Plus} from 'lucide-react';
export default function BannerCardActions({name,active,onEdit,onCreate}:{name:string;active:boolean;onEdit:()=>void;onCreate:()=>void}){
 const menu=useRef<HTMLDetailsElement>(null);
 useEffect(()=>{if(!active&&menu.current)menu.current.open=false;},[active]);
 useEffect(()=>{
  const outside=(event:PointerEvent)=>{if(menu.current?.open&&!menu.current.contains(event.target as Node))menu.current.open=false;};
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'&&menu.current?.open){event.preventDefault();menu.current.open=false;menu.current.querySelector('summary')?.focus();}};
  document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);
  return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
 },[]);
 function run(action:()=>void){if(menu.current){menu.current.open=false;menu.current.querySelector('summary')?.focus();}action();}
 return <details ref={menu} className="banner-card-menu" onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node)&&menu.current)menu.current.open=false;}}><summary aria-label={'Banner actions for '+name}><Ellipsis size={22}/></summary><div className="banner-card-menu-options" role="group" aria-label={name+' editor actions'}><button type="button" onClick={()=>run(onEdit)}><Pencil size={16}/>Edit banner / slots</button><button type="button" onClick={()=>run(onCreate)}><Plus size={16}/>Create hero in banner</button></div></details>;
}
