import allowed from '../lib/public-snapshot-tables.json' with {type:'json'};
type Row=Record<string,any>;
export type Snapshot={schema:number;capturedAt:string;tables:Record<string,Row[]>};
const split=(s:string)=>{const parts:string[]=[];let depth=0,start=0;for(let i=0;i<s.length;i++){if(s[i]==='(')depth++;if(s[i]===')')depth--;if(s[i]===','&&!depth){parts.push(s.slice(start,i));start=i+1;}}parts.push(s.slice(start));return parts;};
function match(value:any,expression:string):boolean{
 if(expression.startsWith('not.'))return !match(value,expression.slice(4));
 const dot=expression.indexOf('.'),op=expression.slice(0,dot),raw=expression.slice(dot+1),target=raw==='null'?null:raw==='true'?true:raw==='false'?false:typeof value==='number'?Number(raw):raw;
 if(op==='eq'||op==='is')return value===target;if(op==='neq')return value!==target;
 if(op==='in')return split(raw.slice(1,-1)).some(v=>String(value)===v.replace(/^"|"$/g,''));
 if(value==null)return false;
 if(op==='gte')return value>=target!;if(op==='lte')return value<=target!;if(op==='gt')return value>target!;if(op==='lt')return value<target!;
 throw Error('Unsupported snapshot filter');
}
export function snapshotResponse(snapshot:Snapshot,url:URL,headers:Headers){
 const table=url.pathname.split('/').pop()!;if(!Object.hasOwn(allowed,table)||!Array.isArray(snapshot.tables[table]))throw Error('No public snapshot');
 let rows=snapshot.tables[table].map(r=>({...r}));
 if(table==='tracker_banners')rows=rows.map(r=>({...r,tracker_banner_heroes:snapshot.tables.tracker_banner_heroes.filter(h=>h.banner_id===r.id)}));
 for(const [field,expression]of url.searchParams){if(['select','order','limit','offset'].includes(field))continue;if(field==='or'||field==='and'){const conditions=split(expression.slice(1,-1)),test=(r:Row,v:string)=>{const dot=v.indexOf('.');return match(r[v.slice(0,dot)],v.slice(dot+1));};rows=rows.filter(r=>field==='or'?conditions.some(v=>test(r,v)):conditions.every(v=>test(r,v)));}else{if(!/^[a-z_][a-z0-9_]*$/i.test(field))throw Error('Unsupported snapshot field');rows=rows.filter(r=>match(r[field],expression));}}
 const order=url.searchParams.get('order');if(order){const keys=split(order).map(v=>v.split('.'));rows.sort((a,b)=>{for(const [key,direction,...options]of keys){const x=a[key],y=b[key];if(x===y)continue;const nullFirst=options.includes('nullsfirst')||(!options.includes('nullslast')&&direction==='desc');if(x==null)return nullFirst?-1:1;if(y==null)return nullFirst?1:-1;return (x<y?-1:1)*(direction==='desc'?-1:1);}return 0;});}
 const total=rows.length,range=headers.get('range')?.match(/^(\d+)-(\d+)$/),start=range?Number(range[1]):Number(url.searchParams.get('offset')||0),limit=range?Number(range[2])-start+1:Number(url.searchParams.get('limit')||rows.length);rows=rows.slice(start,start+limit);
 const select=url.searchParams.get('select');if(select&&select!=='*'){const fields=split(select);rows=rows.map(row=>{const result:Row={};for(const field of fields){if(field==='*')Object.assign(result,row);else if(field.startsWith('tracker_banner_heroes('))result.tracker_banner_heroes=row.tracker_banner_heroes;else if(/^[a-z_][a-z0-9_]*$/i.test(field))result[field]=row[field];else throw Error('Unsupported snapshot projection');}return result;});}
 const single=headers.get('accept')?.includes('application/vnd.pgrst.object+json');if(single&&rows.length!==1)return new Response(JSON.stringify({code:'PGRST116',details:`The result contains ${rows.length} rows`,message:'JSON object requested, multiple (or no) rows returned'}),{status:406,headers:{'Content-Type':'application/json'}});
 return new Response(JSON.stringify(single?rows[0]:rows),{headers:{'Content-Type':'application/json','Content-Range':rows.length?`${start}-${start+rows.length-1}/${total}`:`*/${total}`,'X-FEH-Snapshot':snapshot.capturedAt}});
}
export function createPublicDataFetch(origin:string,snapshotUrl:string,fetcher:typeof fetch=fetch):typeof fetch{
 let pending:Promise<Snapshot>|undefined;let fallbackUntil=0;
 const snapshot=()=>pending??=(async()=>{const r=await fetcher(snapshotUrl,{signal:AbortSignal.timeout(10000),cache:'no-cache'});if(!r.ok)throw Error('Public snapshot unavailable');const value=await r.json();if(value.schema!==1||!value.capturedAt)throw Error('Invalid public snapshot');return value as Snapshot;})().catch(e=>{pending=undefined;throw e;});
 return async(input,init)=>{
  const url=new URL(typeof input==='string'?input:input instanceof URL?input.href:input.url);const method=(init?.method||(input instanceof Request?input.method:'GET')).toUpperCase();const table=url.pathname.split('/').pop()!;
  const eligible=url.origin===origin&&url.pathname.startsWith('/rest/v1/')&&method==='GET'&&Object.hasOwn(allowed,table)&&!(typeof location!=='undefined'&&/FEHRS_AdmManager|administrative/.test(location.pathname));
  if(!eligible)return fetcher(input,init);
  const headers=new Headers(init?.headers||(input instanceof Request?input.headers:undefined));let live:Response|undefined;let failure:unknown;
  if(Date.now()>fallbackUntil){try{const timeout=AbortSignal.timeout(8000);const signal=init?.signal?AbortSignal.any([init.signal,timeout]):timeout;live=await fetcher(input,{...init,signal});if(live.status<500&&live.status!==429)return live;}catch(e){if(init?.signal?.aborted)throw e;failure=e;}}
  try{const data=await snapshot();const response=snapshotResponse(data,url,headers);fallbackUntil=Date.now()+60000;if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('public-snapshot-used',{detail:data.capturedAt}));return response;}catch{if(live)return live;throw failure||Error('Public data temporarily unavailable');}
 };
}
