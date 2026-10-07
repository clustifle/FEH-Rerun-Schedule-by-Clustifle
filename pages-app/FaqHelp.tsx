import {useEffect,useState} from 'react';
import {Search} from 'lucide-react';
type Section='Schedules'|'Browsing'|'Editing'|'About';
type Entry={section:Section;question:string;answer:string;sources?:[string,string][]};
const entries:Entry[]=[
 {
  "section": "Schedules",
  "question": "Which schedule should I use?",
  "answer": "General tracks recorded reruns for Legendary, Mythic, Emblem, and Chosen Heroes. Remix tracks Remix returns. L/M Revival tracks monthly Legendary/Mythic revival entries. NH Revival and HoF Revival show their own event lineups. Open Schedule in navigation to choose a view."
 },
 {
  "section": "Schedules",
  "question": "Are listed rerun months confirmed dates?",
  "answer": "A recorded month is a planning window, not an exact start date. Read the hero note for its source and any uncertainty. Confirmed event dates and lineups should be checked against the in-game announcement. Editors maintain entries manually."
 },
 {
  "section": "Schedules",
  "question": "What do the banner cards show?",
  "answer": "Home shows current and upcoming events, their featured heroes, active dates, and a remaining-time or coming-soon label. L/M/E, New Heroes Return, and Double Special Heroes use color-row lineups. New and Special Heroes use four featured portraits. Revival cards show returning event lineups."
 },
 {
  "section": "Schedules",
  "question": "How does the Remix window work?",
  "answer": "A Remix card contains two groups of eight heroes. Each group has two slots per weapon color. The window fades between Remix 1 and Remix 2; use its group controls to switch manually. Its lineup is separate from the hero’s recorded next rerun month."
 },
 {
  "section": "Schedules",
  "question": "How are New Heroes Return and NH Revival different?",
  "answer": "New Heroes Return is a returning-hero banner shown in the color-row banner layout. NH Revival is the separate New Heroes Revival schedule, including returning lineups associated with Forging Bonds. They have separate entries and are not interchangeable."
 },
 {
  "section": "Schedules",
  "question": "Where can I find Hall of Forms revivals?",
  "answer": "Open Schedule → HoF Revival Schedule. Browse its month entries and select a portrait for Hero Details. Hall of Forms is an event lineup, not a summoning banner; a featured grail unit is not made summonable by appearing there."
 },
 {
  "section": "Schedules",
  "question": "Why are there three rerun waitlists?",
  "answer": "Open Rerun Waitlist and choose L/M/E Waitlist, DSH Waitlist, or NHR Waitlist. They track separate rerun arrangements for Legendary/Mythic/Emblem, Double Special Heroes, and New Heroes Return. Each list has its own membership and order, without a month browser."
 },
 {
  "section": "Schedules",
  "question": "Are heroes added to a waitlist automatically?",
  "answer": "No. Only the Head Administrator and authorized Schedule Managers manually add entries. Changing a hero’s schedule category does not add it to a waitlist. Removing a waitlist entry keeps the hero in the roster and does not remove it from banners or other waitlists."
 },
 {
  "section": "Browsing",
  "question": "How do I search and filter heroes?",
  "answer": "Open a schedule or All Heroes, then search by name or title. Filters can narrow results by hero type, weapon color, and pool. The Filters panel opens on the right. If a hero seems missing, clear the search and reset filters. Results remain limited to the view you selected."
 },
 {
  "section": "Browsing",
  "question": "What is the difference between Standard and Compact view?",
  "answer": "Standard uses larger portraits and more space for browsing. Compact keeps portraits small and makes dense lists easier to scan. Both adapt to browser size; wide schedules can scroll horizontally. Select a hero to see full details in either view."
 },
 {
  "section": "Browsing",
  "question": "What do the portrait icons mean?",
  "answer": "Weapon type appears at the upper left, hero type at the lower left, and movement type at the lower right. General and Special heroes leave the hero-type corner blank. Heroic Grails-marked units display the grail icon. Hover previews and Hero Details provide the recorded labels and notes."
 },
 {
  "section": "Browsing",
  "question": "How do Heroic Grails and Grail Pool work?",
  "answer": "Editors can mark Heroic Grails with a checkbox and assign Grail Pool separately. The grail icon and tag appear in portraits and details. Use the grail visibility toggle, including in HoF revivals, to show or hide marked units. Hiding a unit does not delete it or change an event lineup."
 },
 {
  "section": "Browsing",
  "question": "What do hero pool labels mean?",
  "answer": "Pool labels group heroes as General Pool, Seasonal Limited, Non-Seasonal Limited, L/M/E Pool, or Grail Pool. Pool and hero type are separate fields and can be set independently by editors. These labels describe the tracker’s records; check the actual event for summoning availability."
 },
 {
  "section": "Browsing",
  "question": "Why does a hero have no rerun schedule or month?",
  "answer": "Editors can choose None to leave both schedule and month blank while retaining notes. None is an editor option, not a separate schedule page. Unscheduled heroes remain available in All Heroes and Hero Details."
 },
 {
  "section": "Browsing",
  "question": "How do I browse months and open Hero Details?",
  "answer": "Use Browse Month to choose a year and month, or step through available months with the arrows. Unavailable months are disabled. Current month returns to the current period. Hover over a portrait on desktop for a preview, or click or tap it for Hero Details. Waitlists have no month browser."
 },
 {
  "section": "Browsing",
  "question": "How do themes and Settings work?",
  "answer": "Settings → Personalization offers the default Fire Emblem Heroes theme and ten realm variants, including separate light and dark dream realms. You can adjust view size, text, tags, remembered navigation, carousel behavior, and motion. Date & time controls the clock and timezone. Preferences are saved on this device."
 },
 {
  "section": "Browsing",
  "question": "How does the home carousel work?",
  "answer": "Use the arrows or numbered tiles to select a banner. Play or pause controls automatic rotation. Settings → Personalization → Home carousel sets auto-play, time per banner, and pause on hover. The controls use the selected realm’s colors; there is no animated countdown progress bar."
 },
 {
  "section": "Browsing",
  "question": "Does the website update automatically?",
  "answer": "Visible pages check for a newly published deployment and when you return or reconnect. Schedule data no longer reloads every 30 seconds. When a successful deployment is available, the site updates when panels are closed and you are no longer typing. Settings → Updates lets you control automatic updates or use Refresh now."
 },
 {
  "section": "Browsing",
  "question": "How do I reset my preferences?",
  "answer": "Open Settings → Personalization → Reset, choose Reset settings, then confirm Restore defaults. This resets device preferences without deleting heroes, schedule data, or your account. Cancel keeps your preferences."
 },
 {
  "section": "Browsing",
  "question": "Do I need an account to browse?",
  "answer": "No. You can browse schedules, heroes, waitlists, Settings, and FAQ without signing in. Sign in or Sign up from navigation to use account features. New accounts have visitor access; registering does not grant schedule-editing permissions."
 },
 {
  "section": "Browsing",
  "question": "How do profiles and Find Users work?",
  "answer": "Profile opens your public profile when signed in. Settings → Account lets you update your username, display name, picture, bio, and visibility choices. Find Users searches public usernames and display names. Sign-in emails are private and do not appear in public search. Changing your username changes its public profile link."
 },
 {
  "section": "Editing",
  "question": "Who can edit live schedules and manage access?",
  "answer": "The Head Administrator and authorized Schedule Managers can maintain heroes, banners, revivals, and waitlists. Only the Head Administrator manages editor access. Public contributions are welcome from everyone, but live editing permissions remain restricted to authorized accounts."
 },
 {
  "section": "Editing",
  "question": "How do I add or edit a hero?",
  "answer": "Use Add hero in the relevant view or Edit hero in Hero Details. The editor opens in a panel rather than filling the desktop screen. Set the name, title, type, weapon and movement details, color, pool, schedule, month when required, and notes. Demote and Heroic Grails have separate checkboxes. Save publishes the change."
 },
 {
  "section": "Editing",
  "question": "How do I add or edit a banner lineup?",
  "answer": "Open Add banner or edit an existing banner. Choose its type, name, active dates and times, and featured heroes. Clicking a hero slot opens the Select a hero picker. Remix has two groups of eight with two slots per color; other layouts follow their selected banner type. Banner membership is separate from a hero’s rerun schedule."
 },
 {
  "section": "Editing",
  "question": "How do I update revival entries?",
  "answer": "Open Edit revival in NH Revival or HoF Revival to update the title and featured heroes. If an event is currently ongoing, supply its active dates and UTC times to show its remaining-time label. Review the lineup and save. The two revival schedules are maintained separately."
 },
 {
  "section": "Editing",
  "question": "How do I reorganize banners and waitlists?",
  "answer": "Open Reorganize in the relevant view, adjust the order, and save. Waitlists are reorganized independently; changing one does not reorder the others. Review the selected list or banner section before saving."
 },
 {
  "section": "Editing",
  "question": "How do portrait uploads work?",
  "answer": "Choose, drop, or paste a PNG, JPG, or WebP image up to 3 MB. Supported direct FEH Wiki/Fandom image links can be imported. Wait for the preview before saving. Portraits are optimized when this reduces their size; optimized copies are served from GitHub Pages, with live Storage fallback for new uploads."
 },
 {
  "section": "About",
  "question": "How do I install the website as an app?",
  "answer": "Open navigation → Install App, then select Install. When your browser provides a PWA install prompt, the button opens it for confirmation. Otherwise, it shows short browser instructions. On iPhone or iPad, use Safari → Share → Add to Home Screen. Current schedules and editing need an internet connection.",
  "sources": [
   [
    "PWA installation support",
    "https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Trigger_install_prompt"
   ]
  ]
 },
 {
  "section": "About",
  "question": "Can anyone contribute to the website?",
  "answer": "Yes. Everyone can suggest rerun information, hero corrections, features, design improvements, or bug reports through GitHub issues. Testing, documentation, and code contributions are also welcome. Include a source for schedule corrections and distinguish confirmed information from predictions. Maintainers review submissions before applying live changes.",
  "sources": [
   [
    "Contributing Guidelines",
    "https://github.com/clustifle/FEH-Rerun-Schedule-by-Clustifle/blob/main/CONTRIBUTING.md"
   ],
   [
    "Submit an issue",
    "https://github.com/clustifle/FEH-Rerun-Schedule-by-Clustifle/issues"
   ]
  ]
 },
 {
  "section": "About",
  "question": "Is the website open source?",
  "answer": "Original website code and documentation use the MIT License. Nintendo artwork, game UI, backgrounds, supplied fonts, and other third-party materials retain their own rights and terms. The code license does not grant permission to reuse those assets.",
  "sources": [
   [
    "MIT License",
    "https://github.com/clustifle/FEH-Rerun-Schedule-by-Clustifle/blob/main/LICENSE"
   ],
   [
    "Third-party notices",
    "https://github.com/clustifle/FEH-Rerun-Schedule-by-Clustifle/blob/main/THIRD_PARTY_NOTICES.md"
   ]
  ]
 },
 {
  "section": "About",
  "question": "Where can I find the version and credits?",
  "answer": "Open Settings → About for the website logo, release version, credits, copyright, and special thanks. Installation is in the navigation menu, not in About."
 }
];
export default function FaqHelp({canEdit=false}:{canEdit?:boolean}){
 const [query,setQuery]=useState(''),[section,setSection]=useState<Section|'All'>('All');
 useEffect(()=>{if(!canEdit&&section==='Editing')setSection('All');},[canEdit,section]);
 const topics=(['All','Schedules','Browsing','Editing','About'] as const).filter(topic=>canEdit||topic!=='Editing');
 const filtered=entries.filter(e=>(canEdit||e.section!=='Editing')&&(section==='All'||section===e.section)&&(e.question+' '+e.answer).toLowerCase().includes(query.trim().toLowerCase()));
 const topicLabel=(topic:string)=>topic==='Editing'?'Editor instructions':topic==='About'?'App & community':topic;
 return <section className="settings-inline faq-inline" aria-labelledby="faq-title"><header className="settings-header"><div><h2 id="faq-title">FAQ</h2><p>{canEdit?'Schedule guide and editor instructions.':'Your guide to schedules, banners, and heroes.'}</p></div></header><div className="settings-layout"><label className="settings-mobile-section">FAQ topic<select value={section} onChange={e=>setSection(e.target.value as Section|'All')}>{topics.map(topic=><option key={topic} value={topic}>{topicLabel(topic)}</option>)}</select></label><nav className="settings-sections" aria-label="FAQ topics">{topics.map(topic=><button key={topic} aria-current={section===topic?'location':undefined} onClick={()=>setSection(topic)}>{topicLabel(topic)}</button>)}</nav><div className="settings-body"><label className="faq-search"><Search size={18} aria-hidden="true"/><input type="search" aria-label="Search FAQ" placeholder="Search schedules, banners, or heroes…" value={query} onChange={e=>setQuery(e.target.value)}/></label><div className="faq-content"><p className="faq-count" role="status">{filtered.length} {filtered.length===1?'answer':'answers'}</p>{filtered.map(e=><details key={e.question} className="faq-entry" open={query.trim()?true:undefined}><summary>{e.question}</summary><div><p>{e.answer}</p>{e.sources&&<nav aria-label={'Sources for '+e.question}>{e.sources.map(([name,url])=><a key={url} href={url} target="_blank" rel="noopener noreferrer">{name} ↗</a>)}</nav>}</div></details>)}{!filtered.length&&<p className="faq-empty">No matching answers. Try another topic or search.</p>}</div></div></div></section>;
}
