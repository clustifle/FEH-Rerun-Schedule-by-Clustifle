// Stable view URLs; account IDs are immutable Supabase UUIDs, never emails.
export const viewPaths:Record<string,string>={Polls:'polls','Mods Tool':'mods-tool',Homepage:'home',General:'schedule/general',Remix:'schedule/remix','Monthly Revival':'schedule/monthly-revival','Forging Bonds Revival':'schedule/new-heroes-revival','Hall of Forms Revival':'schedule/hall-of-forms-revival',Waitlist:'rerun-waitlist/lme','DSH Waitlist':'rerun-waitlist/dsh','NHR Waitlist':'rerun-waitlist/nhr',Profile:'profile',Users:'users','All Heroes':'all-heroes'};
export const uuidPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function readRoute(){
 const base=import.meta.env.BASE_URL;const path=location.pathname.startsWith(base)?location.pathname.slice(base.length).replace(/\/$/,''):'';
 const params=new URLSearchParams(location.search);const profile=path.startsWith('profile/')?path.slice(8).replace(/^id=/,''):params.get('profile')||'';
 const faq=path==='faq';
 const settings=faq||path==='account'||path==='settings'||path.startsWith('settings/');
 let hero='';if(path.startsWith('hero_profile/')){try{hero=decodeURIComponent(path.slice(13));}catch{hero=path.slice(13);}}
 const view=path.startsWith('mods-tool/')?'Mods Tool':path==='rerun-waitlist'?'Waitlist':profile?'Profile':Object.keys(viewPaths).find(key=>viewPaths[key]===path)||(params.get('schedule')&&viewPaths[params.get('schedule')!] ? params.get('schedule') : null);
 return {view,profile,hero,settings,faq,section:path==='account'?'Account':path.split('/')[1]||'',explicit:!!path||params.has('profile')||params.has('schedule')};
}
export function viewUrl(view:string,month='',profile=''){return import.meta.env.BASE_URL+(viewPaths[view]||'home')+(view==='Profile'&&profile?'/'+encodeURIComponent(profile):'')+(month?'?month='+encodeURIComponent(month):'');}
export function goTo(url:string,replace=false){if(location.pathname+location.search===url)return;history[replace?'replaceState':'pushState'](null,'',url+location.hash);window.dispatchEvent(new Event('route-change'));}
export function settingsUrl(section=''){return import.meta.env.BASE_URL+'settings'+(section?'/'+section.toLowerCase().replace(/ & /g,'-').replace(/ /g,'-'):'');}
// The generated GitHub Pages 404 redirects only within this project's base path.
export function restorePagesRoute(){const params=new URLSearchParams(location.search);const route=params.get('__route');if(route&&route.startsWith(import.meta.env.BASE_URL)&&!route.startsWith('//')){history.replaceState(null,'',route);}if(location.pathname.replace(/\/$/,'')===import.meta.env.BASE_URL+'rerun-waitlist'){history.replaceState(null,'',viewUrl('Waitlist')+location.search);}}

export function heroSlug(hero:{id:string;name:string;category:string;title:string},heroes:{id:string;name:string;category:string;title:string}[]){
 const word=(s:string)=>s.trim().replace(/\s+/g,'_');
 const type=hero.category==='Chosen Hero'?'Chosen':hero.category;
 let slug=[hero.name,hero.title||'Untitled',type].map(word).join('_');
 if(heroes.filter(h=>[h.name,h.title||'Untitled',h.category==='Chosen Hero'?'Chosen':h.category].map(word).join('_')===slug).length>1)slug+='_'+hero.id;
 return slug;
}
export function heroUrl(hero:Parameters<typeof heroSlug>[0],heroes:Parameters<typeof heroSlug>[1]){return import.meta.env.BASE_URL+'hero_profile/'+encodeURIComponent(heroSlug(hero,heroes));}
