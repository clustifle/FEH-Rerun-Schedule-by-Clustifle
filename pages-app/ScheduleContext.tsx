import {useEffect,useRef,useState} from 'react';
import {Link,Check} from 'lucide-react';
import {scheduleViews,waitingViews,scheduleGuidance} from './schedule-context';
import './ScheduleContext.css';
export default function ScheduleContext({active,disabled,onNavigate}:{active:string;disabled:boolean;onNavigate:(view:string)=>void}){
 const [message,setMessage]=useState(''),request=useRef(0);
 useEffect(()=>{request.current++;setMessage('');},[active]);
 if(![...scheduleViews,...waitingViews].some(([view])=>view===active))return null;
 async function copy(){const id=++request.current;try{await navigator.clipboard.writeText(location.href);if(id===request.current)setMessage('Page link copied');}catch{if(id===request.current)setMessage('Copy the page address from your browser to share this view.');}}
 return <section className="schedule-context" aria-label="Schedule tools"><div className="schedule-context-tools"><label>Schedule view<select aria-label="Schedule view" value={active} disabled={disabled} onChange={e=>onNavigate(e.target.value)}><optgroup label="Schedules">{scheduleViews.map(([value,label])=><option key={value} value={value}>{label}</option>)}</optgroup><optgroup label="Waiting lists">{waitingViews.map(([value,label])=><option key={value} value={value}>{label}</option>)}</optgroup></select></label><button type="button" className="secondary" disabled={disabled} onClick={()=>void copy()}>{message==='Page link copied'?<Check size={16}/>:<Link size={16}/>}Copy page link</button></div><p className="schedule-date-guidance">{scheduleGuidance(active)}</p><details className="schedule-date-guide"><summary>How to read dates and predictions</summary><dl><div><dt>Announced / confirmed</dt><dd>Supported by a recorded announcement. A month alone does not specify a start day.</dd></div><div><dt>Predicted</dt><dd>A staff estimate that may change. It never becomes confirmed just because the month arrives.</dd></div><div><dt>Waitlist / under consideration</dt><dd>No confirmed rerun date. List order does not guarantee banner order.</dd></div></dl></details><span role="status" className="schedule-copy-status">{message}</span></section>;
}
