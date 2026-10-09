import {useSiteContent} from './site-content';
import {useEffect,useState} from 'react';
import {Search} from 'lucide-react';
import './FaqHelp.css';
type Section='Schedules'|'Browsing'|'Editing'|'About';
type Entry={section:Section;question:string;answer:string;sources?:[string,string][]};
const entries:Entry[]=[
 {
  "section": "Schedules",
  "question": "Which schedule should I use?",
  "answer": "Open **Schedule** in the navigation menu and choose the view that matches the event you want to track.\n\n- **General:** Recorded rerun months for Legendary, Mythic, Emblem, and Chosen Heroes.\n- **Remix:** Reruns associated with Remix banners.\n- **L/M Revival:** Monthly Legendary and Mythic revival entries.\n- **NH Revival:** Returning New Heroes lineups and Forging Bonds revivals.\n- **HoF Revival:** Returning Hall of Forms lineups."
 },
 {
  "section": "Schedules",
  "question": "Are listed rerun months confirmed dates?",
  "answer": "A recorded month identifies a **rerun window**, rather than an exact event start date. Read the hero’s notes for the source, supporting information, and any uncertainty.\n\nCheck **in-game announcements** for confirmed dates and featured lineups. The Head Administrator and Schedule Managers maintain the website’s records manually."
 },
 {
  "section": "Schedules",
  "question": "What do the banner cards show?",
  "answer": "The Home page displays current and upcoming events, featured heroes, active dates, and a **remaining-time** or **coming-soon** label.\n\n- **L/M/E, New Heroes Return, and Double Special Heroes:** Lineups grouped by weapon color.\n- **New and Special Heroes:** Four featured hero portraits.\n- **Remix:** Two selectable groups of eight heroes.\n- **Revivals:** Returning New Heroes or Hall of Forms event lineups.\n\nDisplayed times follow your selected timezone in **Settings → Date & time**."
 },
 {
  "section": "Schedules",
  "question": "How does the Remix window work?",
  "answer": "A Remix card contains **two groups of eight heroes**, with two slots per weapon color in each group.\n\nThe card transitions between **Remix 1** and **Remix 2**. Use its group controls to select a lineup manually.\n\nA hero’s appearance in that lineup is recorded separately from their next scheduled rerun month."
 },
 {
  "section": "Schedules",
  "question": "How are New Heroes Return and NH Revival different?",
  "answer": "**New Heroes Return** is a returning-hero summoning banner. Its card groups featured heroes by weapon color, and it has a separate NHR Waitlist.\n\n**NH Revival** is the New Heroes Revival schedule, including returning lineups associated with Forging Bonds revivals.\n\nThese views maintain separate entries. Check the event name and notes to identify the relevant rerun."
 },
 {
  "section": "Schedules",
  "question": "Where can I find Hall of Forms revivals?",
  "answer": "Open **Schedule → HoF Revival Schedule**, choose an available month, and select a portrait to open the hero’s full profile.\n\n**Hall of Forms is an event lineup.** Appearing in Hall of Forms does not make a Heroic Grails unit summonable on a banner. Use the Grail visibility toggle if you want to hide those units while browsing."
 },
 {
  "section": "Schedules",
  "question": "Why are there three rerun waitlists?",
  "answer": "The waitlists separate heroes by the type of rerun being tracked. Open **Rerun Waitlist** in navigation and choose a list.\n\n- **L/M/E Waitlist:** Heroes awaiting a recorded rerun that may involve a Legendary, Mythic, or Emblem banner.\n- **DSH Waitlist:** Heroes awaiting a Double Special Heroes rerun.\n- **NHR Waitlist:** Heroes awaiting a New Heroes Return rerun.\n\nEach list has its own membership and order. Waitlists do not use the month browser."
 },
 {
  "section": "Schedules",
  "question": "Which heroes can appear in the L/M/E Waitlist?",
  "answer": "Alongside Legendary, Mythic, and Emblem Heroes, the L/M/E Waitlist may include **General, Special, Rearmed, Attuned, Aided, Entwined, and Vista Heroes** after their release in a New Heroes or Special Heroes summoning event.\n\nAn entry tracks a **possible rerun whose timing or banner is uncertain**. Inclusion does not confirm that the hero will return on an L/M/E banner or guarantee a rerun date.\n\nOnly the **Head Administrator** and authorized **Schedule Managers** manually add or edit entries. A hero’s debut does not add them automatically."
 },
 {
  "section": "Schedules",
  "question": "Are heroes added to a waitlist automatically?",
  "answer": "**No.** The Head Administrator and authorized Schedule Managers add waitlist entries manually. Changing a hero’s schedule category does not add them to a waitlist.\n\nRemoving a waitlist entry keeps the hero in the roster. It does not remove the hero from banner lineups or other waitlists."
 },
 {
  "section": "Browsing",
  "question": "How do I search and filter heroes?",
  "answer": "Use the search field in a schedule or **All Heroes** to find heroes by name or title. All Heroes also searches hero types and notes.\n\nOpen **Filters** to narrow results by the options available in that view, including hero type, weapon color and type, movement, pool, and Heroic Grails visibility. All Heroes also offers schedule, blessing, and demote filters.\n\nIf a hero appears to be missing, clear the search and reset the filters. Search results remain limited to the selected view."
 },
 {
  "section": "Browsing",
  "question": "What is the difference between Standard and Compact view?",
  "answer": "**Standard** uses larger portraits and more spacing. **Compact** uses smaller portraits to make dense schedules easier to scan. Both adapt to the browser size, and wide schedules can scroll horizontally.\n\nAll Heroes has its own **Cards, Compact, List, and Table** views, together with ten sorting options.\n\nSelect a hero in any view to open their full **Hero Profile**. You can share that page’s address; the link includes the hero’s name, title, and type."
 },
 {
  "section": "Browsing",
  "question": "What is up with the random heroes selection?",
  "answer": "The roster is maintained manually and supports more than Legendary, Mythic, Emblem, Chosen, or recently released Duo and seasonal heroes.\n\nHeroes are also recorded for **banner lineups, rerun waitlists, New Heroes revivals, and Hall of Forms revivals**. This is why older heroes such as Summer Freyja and Wind Tribe Catria may appear.\n\nA roster entry alone does not confirm an upcoming rerun. Check the hero’s schedule, month, and notes. Weapon and movement details are entered manually, so some records may still be incomplete."
 },
 {
  "section": "Browsing",
  "question": "What do the portrait icons mean?",
  "answer": "Portrait icons identify the hero’s recorded characteristics.\n\n- **Upper left:** Weapon type.\n- **Lower left:** Hero type, where applicable.\n- **Lower right:** Movement type.\n- **Heroic Grails icon:** The hero is marked as a Heroic Grails unit.\n\nGeneral and Special Heroes leave the hero-type corner blank. Desktop hover previews and full Hero Profiles show the recorded labels and notes."
 },
 {
  "section": "Browsing",
  "question": "How do Heroic Grails and Grail Pool work?",
  "answer": "**Heroic Grails** is a separate checkbox in the hero editor. **Grail Pool** is a separate pool assignment. Editors maintain both fields manually.\n\nMarked units display a grail icon and label on portraits, hover previews, and Hero Profiles. Use the **Grail visibility toggle**, including in HoF revivals, to show or hide these units.\n\nHiding a unit changes your displayed results only; it does not delete the hero or change an event’s recorded lineup."
 },
 {
  "section": "Browsing",
  "question": "What do hero pool labels mean?",
  "answer": "Pool labels organize the tracker’s hero records into **General Pool, Seasonal Limited, Non-Seasonal Limited, L/M/E Pool, and Grail Pool**.\n\n**Pool** and **hero type** are separate fields that editors can assign independently. Check the actual event’s summoning details for availability; a tracker label alone does not establish whether a hero is summonable."
 },
 {
  "section": "Browsing",
  "question": "Why does a hero have no rerun schedule or month?",
  "answer": "Editors can select **None** to leave the schedule and rerun month blank while keeping the hero’s notes.\n\nNone is an editor option and does not have a separate schedule page. Unscheduled heroes remain available in **All Heroes** and on their full Hero Profiles."
 },
 {
  "section": "Browsing",
  "question": "How do I browse months and open Hero Details?",
  "answer": "Use **Browse Month** to select a year and month, or use the arrows to move through available months. **Current month** returns to the current period.\n\nPublic visitors see months containing recorded rerun heroes or NH/HoF revival entries. Empty months are hidden; editors retain them for scheduling.\n\nHover over a portrait on desktop for a preview, or click or tap it to open the full **Hero Profile**. Returning from a profile preserves the selected schedule month. Waitlists do not have a month browser."
 },
 {
  "section": "Browsing",
  "question": "How do themes and Settings work?",
  "answer": "Open **Settings → Personalization** to select the default Fire Emblem Heroes theme or one of ten realm variants. The light and dark dream realms have separate themes.\n\nPersonalization also controls view size, text, tags, remembered navigation, carousel behavior, and motion. **Date & time** controls the clock format and timezone.\n\nThese preferences are saved on the current device."
 },
 {
  "section": "Browsing",
  "question": "How does the home carousel work?",
  "answer": "Use the **arrows** or **numbered tiles** to select a banner. The **Play/Pause** button controls automatic rotation.\n\nOpen **Settings → Personalization → Home carousel** to adjust autoplay, time per banner, and pause on hover.\n\nThe controls follow your selected realm’s colors and use numbered selection buttons instead of an animated countdown progress bar."
 },
 {
  "section": "Browsing",
  "question": "Does the website update automatically?",
  "answer": "When automatic updates are enabled, the website checks for a newly published deployment while visible and when you return or reconnect.\n\nA new deployment is applied when panels are closed and you are no longer typing. Schedule data is not reloaded every 30 seconds.\n\nOpen **Settings → Updates** to manage automatic updates or select **Refresh now**."
 },
 {
  "section": "Browsing",
  "question": "How do I reset my preferences?",
  "answer": "You can restore the current device’s default preferences from Personalization.\n\n1. Open **Settings → Personalization → Reset**.\n2. Select **Reset settings**.\n3. Confirm **Restore defaults**, or choose **Cancel** to keep your preferences.\n\nResetting preferences does not delete heroes, schedule records, or your account."
 },
 {
  "section": "Browsing",
  "question": "Do I need an account to browse?",
  "answer": "**No account is required** to browse schedules, heroes, waitlists, public profiles, Settings, or the FAQ.\n\nUse **Sign in** or **Sign up** in navigation for account features. GitHub is required for new accounts. Existing email accounts without GitHub linked can use **Legacy Sign-in**. Link GitHub in **Settings → Account** to switch; once linked, use GitHub to sign in.\n\nNew accounts have **Visitor** access. Creating an account does not grant schedule-editing permissions."
 },
 {
  "section": "Browsing",
  "question": "How do profiles and Find Users work?",
  "answer": "**Profile** opens your public profile when you are signed in. Select **Edit Profile** to change your username, display name, picture, banner, bio, social links, favorites, and visibility choices in a dedicated popup.\n\n**Find Users** searches public usernames and display names. Sign-in email addresses are private and do not appear in search results.\n\nChanging your username changes your public profile link. Followed heroes and saved schedules remain private to your account."
 },
 {
  "section": "Editing",
  "question": "Who can edit live schedules and manage access?",
  "answer": "The **Head Administrator** and authorized **Schedule Managers** maintain heroes, banners, revivals, and waitlists. Only the Head Administrator manages editor access.\n\nEveryone may submit information, corrections, and project contributions. Live editing remains restricted to authorized accounts."
 },
 {
  "section": "Editing",
  "question": "How do I add or edit a hero?",
  "answer": "Use **Add hero** in the relevant view, or **Edit hero** on a Hero Profile, to open the editor.\n\n1. Enter the hero’s name, title, and type.\n2. Set the weapon color and type, movement type, pool, and any applicable blessing.\n3. Choose a schedule and month when required, or select **None** to keep notes only.\n4. Set the separate **Demote** and **Heroic Grails** checkboxes as appropriate.\n5. Review the notes and select **Save hero** to publish the changes."
 },
 {
  "section": "Editing",
  "question": "How do I add or edit a banner lineup?",
  "answer": "Select **Add banner** on Home, or open a card’s **three-dot menu → Edit banner / slots**.\n\n1. Choose the banner type and enter its name and active dates/times.\n2. Select a hero slot to open the hero picker.\n3. Review the featured lineup and save the banner.\n\nRemix uses two groups of eight heroes, with two slots per weapon color. Other layouts follow the selected banner type. Banner membership is recorded separately from a hero’s rerun schedule."
 },
 {
  "section": "Editing",
  "question": "How do I update revival entries?",
  "answer": "Open **Edit revival** in NH Revival or HoF Revival to update an event’s title and featured heroes.\n\nFor an ongoing event, enter its active dates and **UTC times** to display the remaining-time label. Review the lineup, then save the entry.\n\nNH Revival and HoF Revival are maintained separately."
 },
 {
  "section": "Editing",
  "question": "How do I reorganize banners and waitlists?",
  "answer": "Open **Reorganize** in the relevant view and choose a way to move entries.\n\n- Drag an entry using its handle with a mouse or touch.\n- Use the move controls beside an entry.\n- Press **Alt + Up/Down** on a focused entry.\n\nSelect **Save order** to apply the arrangement. **Reset order** discards unsaved changes. Each waitlist and weapon color is ordered independently."
 },
 {
  "section": "Editing",
  "question": "How do portrait uploads work?",
  "answer": "Choose, drop, or paste a **PNG, JPG, or WebP** portrait up to **3 MB**. Supported direct FEH Wiki/Fandom image links can also be imported.\n\nWait for the image preview, review the hero’s details, and save. Portraits are optimized when doing so reduces their file size.\n\nOptimized public copies are served through GitHub Pages. Newly uploaded portraits use the live Storage fallback until an optimized copy is available."
 },
 {
  "section": "About",
  "question": "How do I install the website as an app?",
  "answer": "Open **navigation → Install App** and select **Install**. If the browser supports a PWA installation prompt, the button opens it for confirmation.\n\nIf a prompt is unavailable, follow the displayed browser instructions. On **iPhone or iPad**, use **Safari → Share → Add to Home Screen**.\n\nCurrent schedules and editing require an internet connection.",
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
  "answer": "**Everyone is welcome to contribute.** You can suggest rerun information, hero corrections, features, design improvements, or bug reports through GitHub issues.\n\nTesting, documentation, and code contributions are also welcome. For schedule corrections, include a source and clearly distinguish **confirmed information** from **predictions**.\n\nMaintainers review submissions before applying changes to the live website. The Contributing Guidelines explain how to get started.",
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
  "answer": "The website’s **original code and documentation use the MIT License**.\n\nNintendo artwork, game UI, backgrounds, supplied fonts, and other third-party materials retain their respective rights and terms. The code license does not grant permission to reuse those assets.\n\nSee the license and third-party notices below for details.",
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
 }
];
function answerText(text:string){return text.split(/(\*\*[^*]+\*\*)/g).map((part,index)=>part.startsWith('**')&&part.endsWith('**')?<strong key={index}>{part.slice(2,-2)}</strong>:part);}
export function FaqAnswer({answer}:{answer:string}){return <div className="faq-answer">{answer.split('\n\n').map((block,index)=>{const lines=block.split('\n');if(lines.every(line=>line.startsWith('- ')))return <ul key={index}>{lines.map((line,i)=><li key={i}>{answerText(line.slice(2))}</li>)}</ul>;if(lines.every(line=>/^\d+\. /.test(line)))return <ol key={index}>{lines.map((line,i)=><li key={i}>{answerText(line.replace(/^\d+\. /,''))}</li>)}</ol>;return <p key={index}>{answerText(block)}</p>;})}</div>;}
export default function FaqHelp({canEdit=false}:{canEdit?:boolean}){
 const content=useSiteContent();const currentEntries:Entry[]=content?content.filter(r=>r.kind==='faq').map(r=>({section:r.section,question:r.title,answer:r.body,sources:r.sources})):entries;
 const [query,setQuery]=useState(''),[section,setSection]=useState<Section|'All'>('All');
 useEffect(()=>{if(!canEdit&&section==='Editing')setSection('All');},[canEdit,section]);
 const topics=(['All','Schedules','Browsing','Editing','About'] as const).filter(topic=>canEdit||topic!=='Editing');
 const filtered=currentEntries.filter(e=>(canEdit||e.section!=='Editing')&&(section==='All'||section===e.section)&&(e.question+' '+e.answer.replace(/\*\*/g,'').replace(/\n/g,' ')).toLowerCase().includes(query.trim().toLowerCase()));
 const topicLabel=(topic:string)=>topic==='Editing'?'Editor instructions':topic==='About'?'App & community':topic;
 return <section className="settings-inline faq-inline" aria-labelledby="faq-title"><header className="settings-header"><div><h2 id="faq-title">FAQ</h2><p>{canEdit?'Schedule guide and editor instructions.':'Your guide to schedules, banners, and heroes.'}</p></div></header><div className="settings-layout"><label className="settings-mobile-section">FAQ topic<select value={section} onChange={e=>setSection(e.target.value as Section|'All')}>{topics.map(topic=><option key={topic} value={topic}>{topicLabel(topic)}</option>)}</select></label><nav className="settings-sections" aria-label="FAQ topics">{topics.map(topic=><button key={topic} aria-current={section===topic?'location':undefined} onClick={()=>setSection(topic)}>{topicLabel(topic)}</button>)}</nav><div className="settings-body"><label className="faq-search"><Search size={18} aria-hidden="true"/><input type="search" aria-label="Search FAQ" placeholder="Search schedules, banners, or heroes…" value={query} onChange={e=>setQuery(e.target.value)}/></label><div className="faq-content"><p className="faq-count" role="status">{filtered.length} {filtered.length===1?'answer':'answers'}</p>{filtered.map(e=><details key={e.question} className="faq-entry" open={query.trim()?true:undefined}><summary>{e.question}</summary><div><FaqAnswer answer={e.answer}/>{e.sources&&<nav aria-label={'Sources for '+e.question}>{e.sources.map(([name,url])=><a key={url} href={url} target="_blank" rel="noopener noreferrer">{name} ↗</a>)}</nav>}</div></details>)}{!filtered.length&&<p className="faq-empty">No matching answers. Try another topic or search.</p>}</div></div></div></section>;
}
