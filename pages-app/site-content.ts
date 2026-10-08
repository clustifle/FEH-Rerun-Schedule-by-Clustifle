import {useEffect,useState} from 'react';
import {supabase} from './static-data';
export type SiteContent={id:string;kind:'faq'|'announcement'|'release';title:string;body:string;section:'Schedules'|'Browsing'|'Editing'|'About';sources:[string,string][];sort_order:number;published:boolean;updated_at:string};
let cached:SiteContent[]|null=null,pending:Promise<SiteContent[]>|null=null;
async function readContent(){if(cached)return cached;if(!pending)pending=(async()=>{const {data,error}=await supabase.from('tracker_site_content').select('*').eq('published',true).order('sort_order');if(error)throw error;cached=data as SiteContent[];return cached;})().finally(()=>{pending=null;});return pending;}
export function refreshSiteContent(){cached=null;window.dispatchEvent(new Event('site-content-change'));}
export function useSiteContent(){const [rows,setRows]=useState<SiteContent[]|null>(cached);useEffect(()=>{let mounted=true;const load=()=>{void readContent().then(data=>{if(mounted)setRows(data);}).catch(()=>{});};const refresh=()=>{cached=null;load();};load();window.addEventListener('site-content-change',load);window.addEventListener('refresh-now',refresh);return()=>{mounted=false;window.removeEventListener('site-content-change',load);window.removeEventListener('refresh-now',refresh);};},[]);return rows;}
