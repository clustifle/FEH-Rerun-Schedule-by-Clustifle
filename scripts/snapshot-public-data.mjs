import {readFile,mkdir,writeFile,rename} from 'node:fs/promises';
import tables from '../lib/public-snapshot-tables.json' with {type:'json'};
// Anonymous public access only. No account, profile, tracking, auth or staff tables.
const source=await readFile(new URL('../pages-app/static-data.ts',import.meta.url),'utf8');
const origin=source.match(/export const supabaseUrl='([^']+)'/)[1];
const key=source.match(/export const supabasePublishableKey='([^']+)'/)[1];
const dir=new URL('../public/public-data/',import.meta.url),file=new URL('snapshot.json',dir);
function valid(value){return value?.schema===1&&Object.keys(tables).every(t=>Array.isArray(value.tables?.[t]))&&value.tables.heroes.length>0;}
function sanitize(value){if(!valid(value))throw Error('Incomplete public snapshot');const clean={schema:1,capturedAt:value.capturedAt,tables:{}};for(const [table,spec]of Object.entries(tables))clean.tables[table]=value.tables[table].map(row=>Object.fromEntries(spec.fields.split(',').filter(key=>Object.hasOwn(row,key)).map(key=>[key,row[key]])));return clean;}
try{
 const data={};
 for(const [table,spec] of Object.entries(tables)){
  const rows=[];
  for(let offset=0;;offset+=500){const url=new URL('/rest/v1/'+table,origin);url.search=new URLSearchParams({select:spec.fields,order:spec.order+'.asc',offset:String(offset),limit:'500'}).toString();const response=await fetch(url,{headers:{apikey:key},signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error(table+' returned '+response.status);const page=await response.json();if(!Array.isArray(page))throw Error('Invalid public table '+table);rows.push(...page);if(page.length<500)break;}
  data[table]=rows;console.log(table+': '+rows.length+' public rows');
 }
 const snapshot=sanitize({schema:1,capturedAt:new Date().toISOString(),tables:data});
 await mkdir(dir,{recursive:true});await writeFile(new URL('snapshot.tmp',dir),JSON.stringify(snapshot));await rename(new URL('snapshot.tmp',dir),file);
 console.log('Public snapshot refreshed.');
}catch(error){
 console.warn('Public refresh failed: '+error.message);
 let previous;try{previous=JSON.parse(await readFile(file,'utf8'));}catch{}
 try{const r=await fetch('https://clustifle.github.io/FEH-Rerun-Schedule-by-Clustifle/public-data/snapshot.json',{signal:AbortSignal.timeout(15000)});if(r.ok){const deployed=await r.json();if(valid(deployed)&&(!valid(previous)||deployed.capturedAt>previous.capturedAt))previous=deployed;}}catch{}
 if(!valid(previous))throw Error('No complete public snapshot available; refusing to publish an empty replacement.');
 await mkdir(dir,{recursive:true});await writeFile(file,JSON.stringify(sanitize(previous)));
 console.warn('Keeping last good public snapshot from '+previous.capturedAt);
 if(process.env.GITHUB_STEP_SUMMARY)await writeFile(process.env.GITHUB_STEP_SUMMARY,'Public data refresh failed. Serving the last good snapshot from '+previous.capturedAt+' instead.\n',{flag:'a'});
}
