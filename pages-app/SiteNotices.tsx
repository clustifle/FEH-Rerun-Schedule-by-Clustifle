import {useSiteContent} from './site-content';
import {FaqAnswer} from './FaqHelp';
export default function SiteNotices({kind}:{kind:'announcement'|'release'}){
 const rows=useSiteContent()?.filter(r=>r.kind===kind)||[];
 if(!rows.length)return null;
 return <section className="site-notices" aria-label={kind==='release'?'Release notes':'Announcements'}>{rows.map(row=><article key={row.id}><h3>{row.title}</h3><FaqAnswer answer={row.body}/></article>)}</section>;
}
