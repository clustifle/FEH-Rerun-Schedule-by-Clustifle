import {useEffect} from 'react';
import {portraitFallback} from './static-data';
export default function PortraitRecovery(){
 useEffect(()=>{function failed(event:Event){const img=event.target;if(!(img instanceof HTMLImageElement))return;
  const fallback=portraitFallback(img.currentSrc||img.src);
  const hero=!!img.closest('.shared-hero-portrait,.hero-detail-portrait,.profile-favorite-portrait,.revival-picker-portrait,.hero-portrait,.hero-image');
  if(fallback&&img.dataset.portraitRecovery!=='storage'){img.dataset.portraitRecovery='storage';img.removeAttribute('srcset');img.src=fallback;}
  else if((hero||img.dataset.portraitRecovery==='storage')&&img.dataset.portraitRecovery!=='unavailable'){img.dataset.portraitRecovery='unavailable';img.removeAttribute('srcset');img.src=import.meta.env.BASE_URL+'images/portrait-unavailable.svg';}
 }document.addEventListener('error',failed,true);return()=>document.removeEventListener('error',failed,true);},[]);return null;
}
