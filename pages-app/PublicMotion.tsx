import {useEffect} from 'react';
import './PublicMotion.css';
export default function PublicMotion({page}:{page:string}){
 useEffect(()=>{let frame=requestAnimationFrame(()=>{const root=document.querySelector('.tracker');if(!root||root.closest('.adm-shell')||document.documentElement.dataset.motion==='reduced'||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const content=root.querySelector(':scope > main');if(!content)return;const animation=content.animate([{opacity:.35,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:220,easing:'cubic-bezier(.2,.7,.2,1)'});returnAnimation=animation;});let returnAnimation:Animation|undefined;return()=>{cancelAnimationFrame(frame);returnAnimation?.cancel();};},[page]);return null;
}
