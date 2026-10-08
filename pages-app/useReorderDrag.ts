import {useEffect,useRef,useState,type PointerEvent as ReactPointerEvent,type RefObject} from 'react';
export default function useReorderDrag<T extends {id:string}>(rows:T[],list:RefObject<HTMLOListElement|null>,move:(id:string,index:number)=>void,disabled:boolean){
 const latest=useRef({rows,move,disabled});latest.current={rows,move,disabled};
 const drag=useRef<{id:string;pointer:number;x:number;y:number;startX:number;startY:number;started:boolean}|null>(null);
 const frame=useRef(0);const [draggingId,setDraggingId]=useState(''),[overId,setOverId]=useState('');
 function stop(){cancelAnimationFrame(frame.current);drag.current=null;setDraggingId('');setOverId('');}
 function target(){const current=drag.current,node=list.current;if(!current?.started||!node||latest.current.disabled)return;const rect=node.getBoundingClientRect();if(current.y<rect.top+40)node.scrollTop-=10;else if(current.y>rect.bottom-40)node.scrollTop+=10;const hit=document.elementFromPoint(current.x,current.y)?.closest<HTMLElement>('[data-sort-id]');if(hit&&node.contains(hit)){const id=hit.dataset.sortId||'',index=latest.current.rows.findIndex(row=>row.id===id);setOverId(id);if(id!==current.id&&index>=0)latest.current.move(current.id,index);}}
 function tick(){if(!drag.current)return;target();frame.current=requestAnimationFrame(tick);}
 useEffect(()=>{
  const movePointer=(event:PointerEvent)=>{const current=drag.current;if(!current||current.pointer!==event.pointerId)return;event.preventDefault();current.x=event.clientX;current.y=event.clientY;if(!current.started&&Math.hypot(current.x-current.startX,current.y-current.startY)>6){current.started=true;setDraggingId(current.id);}target();};
  const endPointer=(event:PointerEvent)=>{if(drag.current?.pointer===event.pointerId)stop();};
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'&&drag.current){event.preventDefault();stop();}};
  document.addEventListener('pointermove',movePointer,{passive:false});document.addEventListener('pointerup',endPointer);document.addEventListener('pointercancel',endPointer);document.addEventListener('keydown',escape);window.addEventListener('blur',stop);
  return()=>{document.removeEventListener('pointermove',movePointer);document.removeEventListener('pointerup',endPointer);document.removeEventListener('pointercancel',endPointer);document.removeEventListener('keydown',escape);window.removeEventListener('blur',stop);cancelAnimationFrame(frame.current);};
 },[]);
 useEffect(()=>{if(disabled)stop();},[disabled]);
 function handleProps(id:string){return {
  onPointerDown:(event:ReactPointerEvent<HTMLButtonElement>)=>{if(latest.current.disabled||!event.isPrimary||event.button!==0)return;event.preventDefault();event.currentTarget.focus();drag.current={id,pointer:event.pointerId,x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,started:false};frame.current=requestAnimationFrame(tick);},

 };}
 return {draggingId,overId,handleProps};
}
