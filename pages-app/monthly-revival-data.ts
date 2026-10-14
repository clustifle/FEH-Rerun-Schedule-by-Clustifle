import {useEffect,useState} from 'react';
import {supabase} from './static-data';
type Banner={id:string;hero_1:string;hero_2:string;hero_3:string};
type Event={banner_id:string;month:string|null;under_consideration:boolean};
export function useMonthlyRevivalExports<T extends {id:string;month:string|null;schedule?:string}>(heroes:T[]){
 const [data,setData]=useState<{banners:Banner[];events:Event[]}|null>(null);
 useEffect(()=>{let alive=true;async function all(table:string){const rows:unknown[]=[];for(let offset=0;;offset+=500){const r=await supabase.from(table).select('*').order('id').range(offset,offset+499);if(r.error)throw r.error;rows.push(...r.data);if(r.data.length<500)return rows;}}
  async function load(){try{const [banners,events]=await Promise.all([all('monthly_revival_banners'),all('monthly_revival_events')]);if(alive)setData({banners:banners as Banner[],events:events as Event[]});}catch{/* Keep existing schedule data if the new catalog cannot be reached. */}}
  void load();window.addEventListener('monthly-revivals-change',load);return()=>{alive=false;window.removeEventListener('monthly-revivals-change',load);};
 },[]);
 const monthly:T[]=[],consideration:T[]=[];
 if(!data)return {monthly:heroes.filter(h=>h.schedule==='Monthly Revival'),consideration};
 const seen=new Set<string>();for(const e of data.events){const b=data.banners.find(b=>b.id===e.banner_id);if(!b)continue;for(const id of [b.hero_1,b.hero_2,b.hero_3]){const h=heroes.find(h=>h.id===id),key=id+'|'+(e.under_consideration?'consideration':e.month);if(!h||seen.has(key))continue;seen.add(key);if(e.under_consideration)consideration.push({...h,month:null,schedule:'Schedule Under Consideration'});else if(e.month)monthly.push({...h,month:e.month.slice(0,7),schedule:'Monthly Revival'});}}
 return {monthly,consideration};
}
