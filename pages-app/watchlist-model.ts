export const collections=['Following','Saving for','Merge project','Waiting for rerun'];
export const watchSorts=[['rerun','Upcoming rerun'],['release','Release · newest'],['oldest','Release · oldest'],['name','Name · A–Z'],['name-desc','Name · Z–A']] as const;
export function upcomingMonth(month:string|null|undefined,today=new Date()){const current=today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0');return month&&/^\d{4}-\d{2}/.test(month)&&month.slice(0,7)>=current?month.slice(0,7):null;}
export function compareWatched(a:{name:string;title:string;month?:string|null;release_date?:string|null;debut_version?:string|null},b:typeof a,sort:string){
 const name=()=>a.name.localeCompare(b.name)||a.title.localeCompare(b.title);
 if(sort==='name'||sort==='name-desc')return name()*(sort==='name-desc'?-1:1);
 if(sort==='release'||sort==='oldest'){
  const version=(v:string|null|undefined)=>(v||'0.0').split('.').map(Number);
  const av=version(a.debut_version),bv=version(b.debut_version);
  const release=a.release_date&&b.release_date?a.release_date.localeCompare(b.release_date):(av[0]-bv[0]||av[1]-bv[1]);
  return release*(sort==='release'?-1:1)||name();
 }
 return (upcomingMonth(a.month)||'9999').localeCompare(upcomingMonth(b.month)||'9999')||name();
}
