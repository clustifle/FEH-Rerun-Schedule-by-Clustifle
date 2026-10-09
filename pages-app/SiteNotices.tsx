import {useSiteContent} from './site-content';
import {FaqAnswer} from './FaqHelp';
export default function SiteNotices({kind}:{kind:'announcement'|'release'}){
 const rows=useSiteContent()?.filter(r=>r.kind===kind)||[];
 if(!rows.length&&kind!=='announcement')return null;
 return <section className="site-notices" aria-label={kind==='release'?'Release notes':'Announcements'}>{kind==='announcement'&&<article><h3>News flash: GitHub account sign-in</h3><p>Email sign-in and sign-up will be deprecated soon. GitHub authorization will be required for account access.</p><p>Community voting requires a registered website account with GitHub connected. Existing users can connect GitHub under Settings → Account. Email sign-in remains available during this transition.</p></article>}{rows.map(row=><article key={row.id}><h3>{row.title}</h3><FaqAnswer answer={row.body}/></article>)}</section>;
}
