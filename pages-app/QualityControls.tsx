import {useEffect} from 'react';
export default function QualityControls(){
 useEffect(()=>{
  function keyboard(e:KeyboardEvent){
   if(e.defaultPrevented||e.altKey||e.ctrlKey||e.metaKey)return;
   const tab=e.target instanceof HTMLElement?e.target.closest<HTMLElement>('[role="tab"]'):null,group=tab?.closest<HTMLElement>('[role="tablist"]');
   if(!tab||!group||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key))return;
   const vertical=group.getAttribute('aria-orientation')==='vertical';if((vertical&&['ArrowLeft','ArrowRight'].includes(e.key))||(!vertical&&['ArrowUp','ArrowDown'].includes(e.key)))return;
   const tabs=[...group.querySelectorAll<HTMLElement>('[role="tab"]')].filter(t=>t.closest('[role="tablist"]')===group&&!t.matches(':disabled,[aria-disabled="true"]')&&t.getClientRects().length);
   const current=tabs.indexOf(tab);if(current<0||!tabs.length)return;e.preventDefault();
   const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(current+(['ArrowLeft','ArrowUp'].includes(e.key)?-1:1)+tabs.length)%tabs.length;
   tabs[next].focus();tabs[next].click();
  }
  document.addEventListener('keydown',keyboard);return()=>document.removeEventListener('keydown',keyboard);
 },[]);
 return <a className="quality-skip-link" href="#main-content" onClick={e=>{const main=document.querySelector<HTMLElement>('.tracker main,.adm-content,main');if(!main)return;e.preventDefault();if(!main.id)main.id='main-content';if(!main.hasAttribute('tabindex'))main.tabIndex=-1;main.focus();main.scrollIntoView({block:'start'});}}>Skip to content</a>;
}
