import {useSiteContent} from './site-content';
import {FaqAnswer} from './FaqHelp';
import {useState} from 'react';
import {X} from 'lucide-react';
const newsKey='feh-news-github-transition-v1';
export function NewsFlash(){
 const [closed,setClosed]=useState(()=>{try{return localStorage.getItem(newsKey)==='dismissed';}catch{return false;}});
 if(closed)return null;
 return <aside className="site-news-flash" aria-label="Account sign-in announcement"><p>Email sign-in and sign-up will be deprecated soon. Link GitHub in Settings → Account to prepare for GitHub-required account access.</p><button type="button" className="site-news-close" aria-label="Dismiss account announcement" onClick={()=>{setClosed(true);try{localStorage.setItem(newsKey,'dismissed');}catch{}}}><X size={20}/></button></aside>;
}
export default function SiteNotices({kind}:{kind:'announcement'|'release'}){
 const rows=useSiteContent()?.filter(r=>r.kind===kind)||[];
 if(!rows.length)return null;
 return <section className="site-notices" aria-label={kind==='release'?'Release notes':'Announcements'}>{rows.map(row=><article key={row.id}><h3>{row.title}</h3><FaqAnswer answer={row.body}/></article>)}</section>;
}
