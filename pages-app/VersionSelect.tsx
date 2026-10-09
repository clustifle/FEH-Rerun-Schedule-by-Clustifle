import {useEffect,useSyncExternalStore} from 'react';
import {betaRequest,isBeta} from './beta';
export type FehVersion={version:string;release_date:string|null;sort_order:number};
let versions:FehVersion[]=[],pending:Promise<void>|null=null;const listeners=new Set<()=>void>();
export function loadVersions(force=false){if(!isBeta)return Promise.resolve();if(!pending&&(force||!versions.length))pending=betaRequest('versions').then(rows=>{versions=rows;listeners.forEach(fn=>fn());}).finally(()=>{pending=null;});return pending||Promise.resolve();}
export function useVersions(){useEffect(()=>{void loadVersions().catch(()=>{});},[]);return useSyncExternalStore(fn=>{listeners.add(fn);return()=>listeners.delete(fn);},()=>versions);}
export default function VersionSelect({value,onChange,name,filter=false,disabled=false}:{value?:string;onChange?:(s:string)=>void;name?:string;filter?:boolean;disabled?:boolean}){
 const rows=useVersions();return <label>Debut FEH version<select aria-label="Debut FEH version" name={name} value={onChange?value:undefined} defaultValue={!onChange?value||'':undefined} onChange={e=>onChange?.(e.target.value)} disabled={disabled}><option value={filter?'All':''}>{filter?'Any version':'Not recorded'}</option>{filter&&<option value="Unassigned">Not recorded</option>}{filter&&[...new Set(rows.map(v=>v.version.split('.')[0]))].map(n=><option key={n} value={n+'.x'}>{n}.x — all updates</option>)}{rows.map(v=><option key={v.version} value={v.version}>{v.version}</option>)}</select></label>;
}
