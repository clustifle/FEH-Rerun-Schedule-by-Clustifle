import {assetUrl,portraitUrl} from './static-data';
import {refineHeroKey,refineGroups,type RefineEntry} from '../lib/refine-board';
import type {RefineHero} from './RefinePredictions';
const image=(url:string):Promise<HTMLImageElement|null>=>new Promise(resolve=>{const i=new Image(),timer=setTimeout(()=>resolve(null),8000);i.crossOrigin='anonymous';i.onload=()=>{clearTimeout(timer);resolve(i)};i.onerror=()=>{clearTimeout(timer);resolve(null)};i.src=url});
export type RefineExportOptions={title:string;columns:number;texture:boolean;logo:boolean;weapons:boolean};
export const defaultRefineExport:RefineExportOptions={title:'Refine Predictions',columns:3,texture:true,logo:true,weapons:true};
export async function renderRefines(entries:RefineEntry[],heroes:RefineHero[],view:string,options:RefineExportOptions=defaultRefineExport,pixels=1200,cache=new Map<string,Promise<HTMLImageElement|null>>()){
 const load=(url:string)=>{let pending=cache.get(url);if(!pending){pending=image(url);cache.set(url,pending)}return pending};
 const columns=Math.max(2,Math.min(4,options.columns));
 if(!entries.length)throw Error('No refine entries to export.');if(entries.length>200)throw Error('Narrow your search to 200 heroes or fewer before exporting.');
 await document.fonts.ready;
 const groups=new Map<string,RefineEntry[]>();for(const e of [...entries].sort((a,b)=>(a.month||'9999').localeCompare(b.month||'9999')||refineGroups.indexOf(a.group)-refineGroups.indexOf(b.group)||a.order-b.order)){const label=(e.month||'Waiting list')+'|'+e.group;groups.set(label,[...(groups.get(label)||[]),e])}
 const monthCount=new Set(entries.map(e=>e.month||'Waiting list')).size;
 const width=1200,pad=40,row=88,height=180+monthCount*58+[...groups.values()].reduce((h,rows)=>h+34+Math.ceil(rows.length/columns)*row+16,0)+64;if(height>2600)throw Error('Choose fewer entries for one export.');
 const canvas=document.createElement('canvas');canvas.width=pixels;canvas.height=Math.round(height*pixels/width);const c=canvas.getContext('2d');if(!c)throw Error('Image export is unavailable.');c.scale(pixels/width,pixels/width);c.fillStyle='#102e3a';c.fillRect(0,0,width,height);
 const lookup=new Map(heroes.flatMap(h=>[[h.id,h],[refineHeroKey(h.name,h.title),h]]));const resolved=entries.map(e=>lookup.get(e.heroId||'')||lookup.get(refineHeroKey(e.name,e.title))),assets=new Map<string,HTMLImageElement|null>();const urls=[...new Set(resolved.flatMap(h=>h?.portrait?[portraitUrl(h.portrait)]:[]))];for(let i=0;i<urls.length;i+=8)await Promise.all(urls.slice(i,i+8).map(async u=>assets.set(u,await load(u))));
 const [texture,logo,frame]=await Promise.all([load(assetUrl('themes/fire-emblem-heroes/wallpaper.webp')),load(assetUrl('clustifle-feh-rerun-logo.png')),load(assetUrl('themes/fire-emblem-heroes/portrait-frame.webp'))]);
 if(texture&&options.texture){c.save();c.globalAlpha=.35;c.globalCompositeOperation='soft-light';const scale=Math.max(width/texture.width,height/texture.height);c.drawImage(texture,(width-texture.width*scale)/2,(height-texture.height*scale)/2,texture.width*scale,texture.height*scale);c.restore()}
 const text=(s:string,x:number,y:number,max:number,size=18)=>{c.font=size+'px FEHeroes,Georgia,serif';let label=s;while(label.length&&c.measureText(label).width>max)label=label.slice(0,-1);c.fillText(label===s?s:label.slice(0,-1)+'…',x,y)};
 if(logo&&options.logo)c.drawImage(logo,pad,22,180,180*logo.height/logo.width);c.fillStyle='#fff1cb';text(options.title.trim()||'Refine Predictions',pad,100,width-pad*2,30);c.fillStyle='#bcd5df';text((view==='Upcoming'?'Overview':view)+' · Predictions are estimates, not announcements',pad,133,width-pad*2,16);
 let y=180,previousMonth='';for(const [key,rows] of groups){const [m,group]=key.split('|'),label=m==='Waiting list'?m:new Date(m+'-01T00:00:00Z').toLocaleDateString('en-US',{month:'long',year:'numeric',timeZone:'UTC'});
 if(m!==previousMonth){c.fillStyle='#fff1cb';text(label,pad,y+24,width-pad*2,26);const count=entries.filter(e=>(e.month||'Waiting list')===m).length;c.fillStyle='#bcd5df';text(count+(count===1?' hero':' heroes'),width-pad-100,y+24,100,14);y+=38;c.strokeStyle='#739398';c.beginPath();c.moveTo(pad,y);c.lineTo(width-pad,y);c.stroke();y+=20;previousMonth=m}
 c.fillStyle='#bcd5df';text(group,pad,y+15,width-pad*2,15);y+=34;
 rows.forEach((e,index)=>{const column=(width-pad*2)/columns,x=pad+(index%columns)*column,py=y+Math.floor(index/columns)*row,h=lookup.get(e.heroId||'')||lookup.get(refineHeroKey(e.name,e.title)),pic=h?.portrait?assets.get(portraitUrl(h.portrait)):null;if(pic){c.drawImage(pic,x,py,52,52);if(frame)c.drawImage(frame,x,py,52,52)}else{c.fillStyle='#244650';c.fillRect(x,py,52,52);c.fillStyle='#fff1cb';text(e.name[0],x+18,py+33,30,22)}c.fillStyle='#fff1cb';text(e.name,x+64,py+18,column-80,18);c.fillStyle='#bcd5df';text(options.weapons?(e.weapon||e.title):'',x+64,py+38,column-80,13);c.fillStyle=e.status==='released'?'#a7ddbb':e.status==='announced'?'#a4d6ed':'#e6c88f';const status=e.status==='waiting'?'Unscheduled':e.status==='uncertain'?'Skipped / uncertain':e.status[0].toUpperCase()+e.status.slice(1);text(status+(e.version?' · v'+e.version:''),x+64,py+57,column-80,11)});y+=Math.ceil(rows.length/columns)*row+16}
 c.fillStyle='#bcd5df';text('clustifle.github.io/FEH-Rerun-Schedule-by-Clustifle/ · Refine predictions may change.',pad,height-24,width-pad*2,13);
 return canvas;
}
export async function downloadRefines(canvas:HTMLCanvasElement,month:string){
 const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Could not export image.')),'image/png'));const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='FEH-refines-'+month+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
}
export async function exportRefines(entries:RefineEntry[],heroes:RefineHero[],view:string,month:string){const canvas=await renderRefines(entries,heroes,view,defaultRefineExport,3840);try{await downloadRefines(canvas,month)}finally{canvas.width=1;canvas.height=1}}
