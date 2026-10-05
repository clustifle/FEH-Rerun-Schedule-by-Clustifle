import {useEffect,useRef,useState} from 'react';
import {Search,X} from 'lucide-react';
export default function ToolbarSearch({value,onChange}:{value:string;onChange:(value:string)=>void}){
 const [open,setOpen]=useState(false),input=useRef<HTMLInputElement>(null),trigger=useRef<HTMLButtonElement>(null);
 useEffect(()=>{if(open)input.current?.focus();},[open]);
 return <div className={'toolbar-search'+(open?' is-open':'')+(value?' has-query':'')}><button ref={trigger} className="toolbar-icon" aria-label="Search" title="Search" aria-expanded={open} onClick={()=>setOpen(v=>!v)}><Search size={18}/>{value&&<span className="toolbar-active-dot" aria-hidden="true"/>}</button>{open&&<div className="toolbar-search-field"><input ref={input} type="search" aria-label="Find a hero" placeholder="Find a hero…" value={value} onChange={e=>onChange(e.target.value)} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();setOpen(false);trigger.current?.focus();}}}/><button aria-label={value?'Clear search':'Close search'} title={value?'Clear search':'Close search'} onClick={()=>{if(value){onChange('');input.current?.focus();}else{setOpen(false);trigger.current?.focus();}}}><X size={16}/></button></div>}</div>;
}
