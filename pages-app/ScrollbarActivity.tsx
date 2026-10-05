import {useEffect} from 'react';
export default function ScrollbarActivity(){
 useEffect(()=>{
  const timers=new Map<HTMLElement,ReturnType<typeof setTimeout>>();let frame=0;
  function reveal(element:HTMLElement){element.dataset.scrollbarActive='true';const old=timers.get(element);if(old)clearTimeout(old);timers.set(element,setTimeout(()=>{element.removeAttribute('data-scrollbar-active');timers.delete(element);},1100));}
  function scroll(event:Event){const target=event.target;reveal(target===document?document.documentElement:target as HTMLElement);}
  function pointer(event:PointerEvent){if(event.pointerType!=='mouse'||frame)return;const x=event.clientX,y=event.clientY,path=event.composedPath();frame=requestAnimationFrame(()=>{frame=0;const root=document.documentElement;if(x>=window.innerWidth-24||y>=window.innerHeight-24)reveal(root);for(const node of path){if(!(node instanceof HTMLElement)||node===document.body||node===root)continue;const vertical=node.scrollHeight>node.clientHeight+1,horizontal=node.scrollWidth>node.clientWidth+1;if(!vertical&&!horizontal)continue;const overflow=getComputedStyle(node);if(!/(auto|scroll)/.test(overflow.overflowX+' '+overflow.overflowY))continue;const rect=node.getBoundingClientRect();if((vertical&&x>=rect.right-24&&x<=rect.right)||(horizontal&&y>=rect.bottom-24&&y<=rect.bottom))reveal(node);}});}
  function focus(event:FocusEvent){let node=event.target as HTMLElement|null;while(node&&node!==document.body){if(node.scrollHeight>node.clientHeight||node.scrollWidth>node.clientWidth)reveal(node);node=node.parentElement;}}
  document.addEventListener('scroll',scroll,true);document.addEventListener('pointermove',pointer,{passive:true});document.addEventListener('focusin',focus);
  return()=>{document.removeEventListener('scroll',scroll,true);document.removeEventListener('pointermove',pointer);document.removeEventListener('focusin',focus);cancelAnimationFrame(frame);for(const [node,timer] of timers){clearTimeout(timer);node.removeAttribute('data-scrollbar-active');}};
 },[]);return null;
}
