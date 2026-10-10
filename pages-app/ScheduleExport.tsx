import {useEffect,useRef,useState} from 'react';
import {Share2,X,Download,Link} from 'lucide-react';
import {assetUrl,portraitUrl} from './static-data';
import {viewUrl} from './routes';
import './ScheduleExport.css';
import {useDefinitions,definitionIcon,baseTypes} from './catalog';
type Hero={id:string;name:string;title:string;category:string;color:string;month:string|null;portrait:string|null;weapon_type?:string|null;move_type?:string|null;blessing?:string|null;heroic_grail?:boolean};
const colors=['Red','Blue','Green','Colorless'],ink:Record<string,string>={Red:'#a84855',Blue:'#357895',Green:'#477b57',Colorless:'#647078'};
function label(m:string){return new Date(m+'-01T12:00:00Z').toLocaleDateString('en-US',{month:'long',year:'numeric',timeZone:'UTC'});}
function loadImage(url:string):Promise<HTMLImageElement|null>{return new Promise(resolve=>{const i=new Image();let done=false;const end=(image:HTMLImageElement|null)=>{if(done)return;done=true;clearTimeout(timer);resolve(image);};const timer=setTimeout(()=>end(null),8000);i.crossOrigin='anonymous';i.onload=()=>end(i);i.onerror=()=>end(null);i.src=url;});}
export default function ScheduleExport({heroes,schedule,title,month}:{heroes:Hero[];schedule:string;title:string;month:string}){
 const definitions=useDefinitions();
 const typeIcon=(h:Hero)=>{const type=h.heroic_grail?'Heroic Grails':h.category;if(['','General','Special'].includes(type))return '';if(h.heroic_grail)return assetUrl('hero-types/heroic-grails.webp');if(['Legendary','Mythic','Chosen Hero'].includes(type))return h.blessing?assetUrl((type==='Chosen Hero'?'chosen/':'blessings/')+h.blessing.toLowerCase()+(type==='Chosen Hero'?'.png':'.webp')):'';const icon=definitionIcon(definitions,'hero_type',type);return icon?(icon.startsWith('mods-icons/')?portraitUrl(icon):assetUrl(icon)):baseTypes.includes(type)?assetUrl('hero-types/'+type.toLowerCase()+'.webp'):'';};
 const dialog=useRef<HTMLDialogElement>(null),generation=useRef(0),[open,setOpen]=useState(false),[from,setFrom]=useState(month),[to,setTo]=useState(month),[layout,setLayout]=useState('landscape'),[quality,setQuality]=useState('4k'),[preview,setPreview]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const imageCache=useRef(new Map<string,Promise<HTMLImageElement|null>>());
 const image=(url:string)=>{let promise=imageCache.current.get(url);if(!promise){promise=loadImage(url);imageCache.current.set(url,promise);}return promise;};
 const months=[...new Set(heroes.map(h=>h.month?.slice(0,7)).filter((m):m is string=>!!m&&/^\d{4}-\d{2}$/.test(m)))].sort();
 const included=months.filter(m=>m>=from&&m<=to),selected=heroes.filter(h=>h.month&&included.includes(h.month.slice(0,7)));
 useEffect(()=>{if(open)dialog.current?.showModal();else dialog.current?.close();},[open]);
 useEffect(()=>{generation.current++;setPreview('');setMessage('');if(!open){setBusy(false);return;}setBusy(true);const timer=setTimeout(()=>void generate(),400);return()=>{clearTimeout(timer);generation.current++;};},[from,to,layout,quality,heroes,open,definitions]);
 useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview);},[preview]);
 useEffect(()=>()=>{generation.current++;},[]);
 const close=()=>{generation.current++;setOpen(false);setBusy(false);imageCache.current.clear();};
 async function generate(){
  if(!included.length||from>to){setBusy(false);setMessage('No reruns to export in this range.');return;}
  if(included.length>12){setBusy(false);setMessage('Choose up to 12 populated months per image.');return;}
  const current=++generation.current;setBusy(true);setMessage('');setPreview('');
  try{
   await document.fonts.load('18px FEHeroes');await document.fonts.ready;const font='FEHeroes, Georgia, serif',gap=14,pad=24;
   const cards=included.map(m=>{const groups=colors.map(color=>({color,heroes:selected.filter(h=>h.month?.slice(0,7)===m&&h.color===color)})).filter(g=>g.heroes.length);return {m,groups,width:Math.max(132,...groups.map(g=>g.heroes.length*112+20)),height:40+groups.reduce((sum,g)=>sum+112+8,0)};});
   const packing=(columns:number)=>{let bottom=154,width=0;for(let i=0;i<cards.length;i+=columns){const row=cards.slice(i,i+columns);bottom+=Math.max(...row.map(c=>c.height))+gap;width=Math.max(width,row.reduce((sum,c)=>sum+c.width,0)+(row.length-1)*gap);}return {width:pad*2+width,height:bottom+66};};
   const cols=layout==='landscape'?cards.length:1;
   const w=Math.max(476,packing(cols).width);
   let y=154;const positioned:typeof cards[number][]=[];const positions:{x:number;y:number}[]=[];
   for(let start=0;start<cards.length;start+=cols){const row=cards.slice(start,start+cols);let x=pad;row.forEach(c=>{positioned.push(c);positions.push({x,y});x+=c.width+gap;});y+=Math.max(...row.map(c=>c.height))+gap;}
   const height=y+66;if(height>16000)throw Error('This image is too tall. Select fewer months or use landscape.');
   const resolution=quality==='8k'?7680:3840,outputH=layout==='landscape'?resolution*9/16:resolution,outputW=layout==='landscape'?resolution:Math.max(1,Math.round(outputH*w/height));
   const c=document.createElement('canvas');c.width=outputW;c.height=outputH;const ctx=c.getContext('2d');if(!ctx)throw Error('Image export is unavailable in this browser.');ctx.fillStyle='#102e3a';ctx.fillRect(0,0,outputW,outputH);const scale=Math.min(outputW/w,outputH/height);ctx.setTransform(scale,0,0,scale,0,(outputH-height*scale)/2);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
   const images=new Map<string,HTMLImageElement|null>();const unique=[...new Map(selected.filter(h=>h.portrait).map(h=>[h.portrait!,h])).values()];for(let i=0;i<unique.length;i+=8){await Promise.all(unique.slice(i,i+8).map(async h=>images.set(h.portrait!,await image(portraitUrl(h.portrait!,'detail')))));if(current!==generation.current)return;}
   const iconUrls=[...new Set(selected.flatMap(h=>[h.weapon_type?'weapon-types/'+h.color.toLowerCase()+'-'+h.weapon_type.toLowerCase()+'.webp':'',h.move_type?'move-types/'+h.move_type.toLowerCase()+'.webp':'']).filter(Boolean))];
   const typeUrls=[...new Set(selected.map(typeIcon).filter(Boolean))],types=new Map<string,HTMLImageElement|null>();for(let i=0;i<typeUrls.length;i+=8){await Promise.all(typeUrls.slice(i,i+8).map(async url=>types.set(url,await image(url))));if(current!==generation.current)return;}
   const icons=new Map<string,HTMLImageElement|null>();for(let i=0;i<iconUrls.length;i+=8){await Promise.all(iconUrls.slice(i,i+8).map(async path=>icons.set(path,await image(assetUrl(path)))));if(current!==generation.current)return;}
   const logo=await image(assetUrl('clustifle-feh-rerun-logo.png')),frame=await image(assetUrl('themes/fire-emblem-heroes/portrait-frame.webp'));
   ctx.fillStyle='#102e3a';ctx.fillRect(0,0,w,height);ctx.fillStyle='#fff5dc';ctx.font='28px '+font;
   if(logo)ctx.drawImage(logo,pad,22,192,192*logo.naturalHeight/logo.naturalWidth);
   ctx.fillText(title,pad,107);ctx.font='18px '+font;ctx.fillStyle='#bcd5df';ctx.fillText(label(included[0])+(included.length>1?' – '+label(included.at(-1)!):''),pad,134);
   const text=(value:string,x:number,y:number,max:number,size:number)=>{ctx.font=size+'px '+font;let v=value;while(v.length&&ctx.measureText(v).width>max)v=v.slice(0,-1);ctx.fillText(v===value?v:v.slice(0,-1)+'…',x,y);}
   positioned.forEach((card,index)=>{const {x,y}=positions[index],cardW=card.width;ctx.fillStyle='#1b3c49';ctx.fillRect(x,y,cardW,card.height);ctx.strokeStyle='#bda778';ctx.strokeRect(x+.5,y+.5,cardW-1,card.height-1);ctx.fillStyle='#fff1cb';text(new Date(card.m+'-01T12:00:00Z').toLocaleDateString('en-US',{month:'short',year:'numeric',timeZone:'UTC'}),x+12,y+32,cardW-24,18);let rowY=y+48;
    for(const group of card.groups){
     group.heroes.forEach((h,i)=>{const px=x+12+i*112,py=rowY,size=100,image=h.portrait?images.get(h.portrait):null;ctx.fillStyle='#264b59';ctx.fillRect(px,py,size,size);if(image){ctx.save();ctx.beginPath();ctx.rect(px+6,py+6,size-12,size-12);ctx.clip();const side=Math.min(image.naturalWidth,image.naturalHeight);ctx.drawImage(image,(image.naturalWidth-side)/2,(image.naturalHeight-side)/2,side,side,px,py,size,size);ctx.restore();}else{ctx.fillStyle='#bcd5df';text('No portrait',px+8,py+55,84,13);}if(frame){ctx.save();ctx.filter=h.color==='Red'?'hue-rotate(175deg) saturate(1.35)':h.color==='Blue'?'hue-rotate(20deg)':h.color==='Green'?'hue-rotate(285deg) saturate(1.2)':'grayscale(1)';ctx.drawImage(frame,px,py,size,size);ctx.restore();}
      const weapon=h.weapon_type?icons.get('weapon-types/'+h.color.toLowerCase()+'-'+h.weapon_type.toLowerCase()+'.webp'):null,movement=h.move_type?icons.get('move-types/'+h.move_type.toLowerCase()+'.webp'):null;
      const type=types.get(typeIcon(h));if(type)ctx.drawImage(type,px+1,py+size-26,25,25);if(weapon)ctx.drawImage(weapon,px+1,py+1,25,25);if(movement)ctx.drawImage(movement,px+size-26,py+size-26,25,25);ctx.strokeStyle=ink[group.color];ctx.strokeRect(px+.5,py+.5,size-1,size-1);});rowY+=112+8;
    }
   });
   ctx.fillStyle='#bcd5df';text('clustifle.github.io/FEH-Rerun-Schedule-by-Clustifle/',pad,height-42,w-pad*2,13);text('Rerun plans may change. Check the website for updates.',pad,height-20,w-pad*2,13);
   const blob=await new Promise<Blob>((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(Error('PNG export failed. Try 4K or a smaller range.')),'image/png'));c.width=1;c.height=1;if(current!==generation.current)return;setPreview(URL.createObjectURL(blob));const missing=unique.filter(h=>!images.get(h.portrait!)).length;if(missing)setMessage(missing+' portrait(s) unavailable. Labeled placeholders are included.');
  }catch(e){if(current===generation.current)setMessage(e instanceof Error?e.message:'Export failed. Try again.');}finally{if(current===generation.current)setBusy(false);}
 }
 async function copy(){const url=new URL(viewUrl(schedule,month),location.origin).href;try{await navigator.clipboard.writeText(url);setMessage('Schedule link copied. The link opens this month; image filters are not included.');}catch{setMessage('Copy this link: '+url);}}
 return <><div className="schedule-export-launch"><button className="icon-button" aria-label="Share or export schedule" title="Share or export schedule" onClick={()=>{const start=months.find(m=>m>=month)||months[0]||month;setFrom(start);setTo(months[Math.min(months.indexOf(start)+2,months.length-1)]||start);setPreview('');setMessage('');setBusy(true);setOpen(true);}}><Share2 size={20}/></button></div><dialog ref={dialog} className="schedule-export-dialog" aria-labelledby="schedule-export-title" onCancel={e=>{e.preventDefault();close();}}><header><h2 id="schedule-export-title">Share / Export schedule</h2><button className="icon-button" aria-label="Close schedule export" onClick={close}><X size={20}/></button></header><p>Export the currently filtered heroes. Empty months, colors and slots are omitted.</p><div className="schedule-export-fields"><label>From month<input type="month" value={from} onChange={e=>setFrom(e.target.value)}/></label><label>Through month<input type="month" value={to} onChange={e=>setTo(e.target.value)}/></label><label>Image layout<select value={layout} onChange={e=>setLayout(e.target.value)}><option value="landscape">Landscape · 16:9</option><option value="portrait">Portrait</option></select></label><label>PNG resolution<select value={quality} onChange={e=>setQuality(e.target.value)}><option value="4k">4K · Lossless PNG</option><option value="8k">8K · Lossless PNG</option></select></label></div><p className="schedule-export-summary">{included.length?included.map(label).join(' · '):'No reruns to export in this range.'}</p><div className="schedule-export-actions"><button onClick={()=>void copy()}><Link size={16}/>Copy schedule link</button>{preview&&!busy&&<a download={'feh-'+schedule.toLowerCase().replace(/\s/g,'-')+'-'+from+'-'+to+'-'+quality+'.png'} href={preview}><Download size={16}/>Download PNG</a>}</div>{busy&&<p role="status">Generating preview…</p>}{message&&<p role="status">{message}</p>}{preview&&<img className="schedule-export-preview" src={preview} alt="Schedule export preview"/>}</dialog></>;
}
