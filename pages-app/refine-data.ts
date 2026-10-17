import {useEffect,useSyncExternalStore} from 'react';
import {communityApi} from './community-api';
import {pollApiUrl} from './poll-api';
import {requestTimeout} from './browser-compat';
import type {RefineBoard,RefineEntry} from '../lib/refine-board';
let board:RefineBoard={entries:[],revision:0,updatedAt:null},pending:Promise<RefineBoard>|null=null,lastLoad=0;
const listeners=new Set<()=>void>();
function setBoard(next:RefineBoard){if(next.revision>=board.revision){board=next;lastLoad=Date.now();listeners.forEach(fn=>fn())}return board;}
export function loadRefines(force=false){
 if(pending)return pending;if(!force&&lastLoad&&Date.now()-lastLoad<60000)return Promise.resolve(board);
 const timeout=requestTimeout(20000);
 pending=fetch(pollApiUrl+'/community/refines',{credentials:'omit',cache:'no-store',signal:timeout.signal}).then(async r=>{if(!r.ok)throw Error('Could not load refines. Please retry.');return setBoard(await r.json() as RefineBoard)}).finally(()=>{timeout.clear();pending=null});return pending;
}
export async function saveRefines(entries:RefineEntry[],revision:number){return setBoard(await communityApi<RefineBoard>('/refines',{entries,revision}));}
const subscribe=(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn)}};
export function useRefines(){return useSyncExternalStore(subscribe,()=>board);}
export function useRefineProfileData(){const data=useRefines();useEffect(()=>{void loadRefines().catch(()=>{})},[]);return data;}
