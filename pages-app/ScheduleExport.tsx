import {useEffect,useRef,useState} from 'react';
import {Share2,X,Download,Link} from 'lucide-react';
import {assetUrl,portraitUrl} from './static-data';
import {viewUrl} from './routes';
import './ScheduleExport.css';
type Hero={id:string;name:string;title:string;category:string;color:string;month:string|null;portrait:string|null;weapon_type?:string|null;move_type?:string|null};
const colors=['Red','Blue','Green','Colorless'],ink:Record<string,string>={Red:'#a84855',Blue:'#357895',Green:'#477b57',Colorless:'#647078'};
function label(m:string){return new Date(m+'-01T12:00:00Z').toLocaleDateString('en-US',{month:'long',year:'numeric',timeZone:'UTC'});}
function loadImage(url:string):Promise<HTMLImageElement|null>{return new Promise(resolve=>{const i=new Image();let done=false;const end=(image:HTMLImageElement|null)=>{if(done)return;done=true;clearTimeout(timer);resolve(image);};const timer=setTimeout(()=>end(null),8000);i.crossOrigin='anonymous';i.onload=()=>end(i);i.onerror=()=>end(null);i.src=url;});}
export default function ScheduleExport({heroes,schedule,title,month}:{heroes:Hero[];schedule:string;title:string;month:string}){
 const dialog=useRef<HTMLDialogElement>(null),generation=useRef(0),[open,setOpen]=useState(false),[from,setFrom]=useState(month),[to,setTo]=useState(month),[layout,setLayout]=useState('landscape'),[preview,setPreview]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const months=[...new Set(heroes.map(h=>h.month?.slice(0,7)).filter((m):m is string=>!!m&&/^\d{4}-\d{2}$/.test(m)))].sort();
 const included=months.filter(m=>m>=from&&m<=to),selected=heroes.filter(h=>h.month&&included.includes(h.month.slice(0,7)));
 useEffect(()=>{if(open)dialog.current?.showModal();else dialog.current?.close();},[open]);
 useEffect(()=>{generation.current++;setPreview('');setBusy(false);setMessage('');},[from,to,layout,heroes]);
 useEffect(()=>()=>{generation.current++;},[]);
 const close=()=>{generation.current++;setOpen(false);setBusy(false);};
 async function generate(){
  if(!included.length||from>to){setMessage('No reruns to export in this range.');return;}
  if(included.length>12){setMessage('Choose up to 12 populated months per image.');return;}
  const current=++generation.current;setBusy(true);setMessage('');setPreview('');
  try{
   await document.fonts.load('18px FEHeroes');await document.fonts.ready;const font='FEHeroes, Georgia, serif',cardW=420,gap=20,pad=28;
   const cards=included.map(m=>{const groups=colors.map(color=>({color,heroes:selected.filter(h=>h.month?.slice(0,7)===m&&h.color===color)})).filter(g=>g.heroes.length);return {m,groups,height:64+groups.reduce((sum,g)=>sum+34+Math.ceil(g.heroes.length/3)*150+12,0)};});
   const packing=(columns:number)=>{let bottom=154;for(let i=0;i<cards.length;i+=columns)bottom+=Math.max(...cards.slice(i,i+columns).map(c=>c.height))+gap;return {width:pad*2+columns*cardW+(columns-1)*gap,height:bottom+110};};
   let cols=1;if(layout==='landscape'){let score=Infinity;for(let n=1;n<=Math.min(6,cards.length);n++){const p=packing(n),candidate=Math.abs(Math.log(p.width/p.height/(16/9)));if(candidate<score){score=candidate;cols=n;}}}
   const w=packing(cols).width;
   let y=154;const positioned:typeof cards[number][]=[];const positions:{x:number;y:number}[]=[];
   for(let start=0;start<cards.length;start+=cols){const row=cards.slice(start,start+cols);row.forEach((c,i)=>{positioned.push(c);positions.push({x:pad+i*(cardW+gap),y});});y+=Math.max(...row.map(c=>c.height))+gap;}
   const height=y+110;if(height>16000)throw Error('This image is too tall. Select fewer months or use landscape.');
   const c=document.createElement('canvas');c.width=w;c.height=height;const ctx=c.getContext('2d');if(!ctx)throw Error('Image export is unavailable in this browser.');
   const images=new Map<string,HTMLImageElement|null>();const unique=[...new Map(selected.filter(h=>h.portrait).map(h=>[h.portrait!,h])).values()];for(let i=0;i<unique.length;i+=8){await Promise.all(unique.slice(i,i+8).map(async h=>images.set(h.portrait!,await loadImage(portraitUrl(h.portrait!)))));if(current!==generation.current)return;}
   const iconUrls=[...new Set(selected.flatMap(h=>[h.weapon_type?'weapon-types/'+h.color.toLowerCase()+'-'+h.weapon_type.toLowerCase()+'.webp':'',h.move_type?'move-types/'+h.move_type.toLowerCase()+'.webp':'']).filter(Boolean))];
   const icons=new Map<string,HTMLImageElement|null>();for(let i=0;i<iconUrls.length;i+=8){await Promise.all(iconUrls.slice(i,i+8).map(async path=>icons.set(path,await loadImage(assetUrl(path)))));if(current!==generation.current)return;}
   const logo=await loadImage(assetUrl('clustifle-feh-rerun-logo.png')),frame=await loadImage(assetUrl('themes/fire-emblem-heroes/portrait-frame.webp'));
   ctx.fillStyle='#102e3a';ctx.fillRect(0,0,w,height);ctx.fillStyle='#fff5dc';ctx.font='28px '+font;
   if(logo)ctx.drawImage(logo,pad,22,192,192*logo.naturalHeight/logo.naturalWidth);
   ctx.fillText(title,pad,107);ctx.font='18px '+font;ctx.fillStyle='#bcd5df';ctx.fillText(label(included[0])+(included.length>1?' – '+label(included.at(-1)!):''),pad,134);
   const text=(value:string,x:number,y:number,max:number,size:number)=>{ctx.font=size+'px '+font;let v=value;while(v.length&&ctx.measureText(v).width>max)v=v.slice(0,-1);ctx.fillText(v===value?v:v.slice(0,-1)+'…',x,y);}
   positioned.forEach((card,index)=>{const {x,y}=positions[index];ctx.fillStyle='#1b3c49';ctx.fillRect(x,y,cardW,card.height);ctx.strokeStyle='#bda778';ctx.strokeRect(x+.5,y+.5,cardW-1,card.height-1);ctx.fillStyle='#fff1cb';text(label(card.m),x+18,y+36,cardW-36,24);let rowY=y+60;
    for(const group of card.groups){ctx.fillStyle=ink[group.color];ctx.fillRect(x+16,rowY,cardW-32,28);ctx.fillStyle='#fff';text(group.color,x+24,rowY+20,cardW-48,16);rowY+=36;
     group.heroes.forEach((h,i)=>{const rowCount=Math.min(3,group.heroes.length-Math.floor(i/3)*3),px=x+(cardW-rowCount*130)/2+15+(i%3)*130,py=rowY+Math.floor(i/3)*150,size=100,image=h.portrait?images.get(h.portrait):null;ctx.fillStyle='#264b59';ctx.fillRect(px,py,size,size);if(image){ctx.save();ctx.beginPath();ctx.rect(px+6,py+6,size-12,size-12);ctx.clip();const side=Math.min(image.naturalWidth,image.naturalHeight);ctx.drawImage(image,(image.naturalWidth-side)/2,(image.naturalHeight-side)/2,side,side,px,py,size,size);ctx.restore();}else{ctx.fillStyle='#bcd5df';text('No portrait',px+8,py+55,84,13);}if(frame){ctx.save();ctx.filter=h.color==='Red'?'hue-rotate(175deg) saturate(1.35)':h.color==='Blue'?'hue-rotate(20deg)':h.color==='Green'?'hue-rotate(285deg) saturate(1.2)':'grayscale(1)';ctx.drawImage(frame,px,py,size,size);ctx.restore();}
      const weapon=h.weapon_type?icons.get('weapon-types/'+h.color.toLowerCase()+'-'+h.weapon_type.toLowerCase()+'.webp'):null,movement=h.move_type?icons.get('move-types/'+h.move_type.toLowerCase()+'.webp'):null;
      if(weapon)ctx.drawImage(weapon,px+1,py+1,25,25);if(movement)ctx.drawImage(movement,px+size-26,py+size-26,25,25);ctx.strokeStyle=ink[group.color];ctx.strokeRect(px+.5,py+.5,size-1,size-1);ctx.fillStyle='#fff5dc';text(h.name,px,py+120,120,17);ctx.fillStyle='#bcd5df';text(h.category,px,py+140,120,12);});rowY+=Math.ceil(group.heroes.length/3)*150+12;
    }
   });
   ctx.fillStyle='#bcd5df';text('Exported '+new Date().toLocaleDateString('en-GB')+' · '+selected.length+' heroes',pad,height-86,w-pad*2,15);text('Filtered snapshot · '+included.length+' populated month'+(included.length===1?'':'s'),pad,height-64,w-pad*2,14);text('clustifle.github.io/FEH-Rerun-Schedule-by-Clustifle/',pad,height-42,w-pad*2,13);text('Rerun plans may change. Check the website for updates.',pad,height-20,w-pad*2,13);
   let output=c;if(layout==='landscape'){output=document.createElement('canvas');output.width=3840;output.height=2160;const target=output.getContext('2d');if(!target)throw Error('Image export is unavailable.');target.fillStyle='#102e3a';target.fillRect(0,0,3840,2160);const scale=Math.min(3840/w,2160/height);target.drawImage(c,(3840-w*scale)/2,(2160-height*scale)/2,w*scale,height*scale);}
   const url=output.toDataURL('image/png');if(current!==generation.current)return;setPreview(url);const missing=unique.filter(h=>!images.get(h.portrait!)).length;if(missing)setMessage(missing+' portrait(s) unavailable. Labeled placeholders are included.');
  }catch(e){if(current===generation.current)setMessage(e instanceof Error?e.message:'Export failed. Try again.');}finally{if(current===generation.current)setBusy(false);}
 }
 async function copy(){const url=new URL(viewUrl(schedule,month),location.origin).href;try{await navigator.clipboard.writeText(url);setMessage('Schedule link copied. The link opens this month; image filters are not included.');}catch{setMessage('Copy this link: '+url);}}
 return <><div className="schedule-export-launch"><button className="icon-button" aria-label="Share or export schedule" title="Share or export schedule" onClick={()=>{const start=months.find(m=>m>=month)||months[0]||month;setFrom(start);setTo(months[Math.min(months.indexOf(start)+2,months.length-1)]||start);setPreview('');setMessage('');setOpen(true);}}><Share2 size={20}/></button></div><dialog ref={dialog} className="schedule-export-dialog" aria-labelledby="schedule-export-title" onCancel={e=>{e.preventDefault();close();}}><header><h2 id="schedule-export-title">Share / Export schedule</h2><button className="icon-button" aria-label="Close schedule export" onClick={close}><X size={20}/></button></header><p>Export the currently filtered heroes. Empty months, colors and slots are omitted.</p><div className="schedule-export-fields"><label>From month<input type="month" value={from} onChange={e=>setFrom(e.target.value)}/></label><label>Through month<input type="month" value={to} onChange={e=>setTo(e.target.value)}/></label><label>Image layout<select value={layout} onChange={e=>setLayout(e.target.value)}><option value="landscape">Landscape · 16:9</option><option value="portrait">Portrait</option></select></label></div><p className="schedule-export-summary">{included.length?included.map(label).join(' · '):'No reruns to export in this range.'}</p><div className="schedule-export-actions"><button onClick={()=>void copy()}><Link size={16}/>Copy schedule link</button><button disabled={busy||!included.length||from>to} onClick={()=>void generate()}>{busy?'Preparing image…':'Preview image'}</button>{preview&&<a download={'feh-'+schedule.toLowerCase().replace(/\s/g,'-')+'-'+from+'-'+to+'.png'} href={preview}><Download size={16}/>Download PNG</a>}</div>{message&&<p role="status">{message}</p>}{preview&&<img className="schedule-export-preview" src={preview} alt="Schedule export preview"/>}</dialog></>;
}
