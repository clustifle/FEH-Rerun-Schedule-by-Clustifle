# Fire Emblem Heroes Rerun Schedule

![Fire Emblem Heroes Rerun Schedule by Clustifle](public/clustifle-feh-rerun-logo.png)

**Website made by Clustifle** â€” an unofficial, publicly accessible tracker for hero reruns.

[Open the tracker](https://clustifle.github.io/FEH-Rerun-Schedule-by-Clustifle/) Â· [YouTube](https://www.youtube.com/@Clustifle) Â· [X](https://x.com/Clustifle)

The website was originally made on ChatGPT Sites and later migrated to GitHub Pages with Supabase. The original Sites deployment has been removed. GitHub Pages is the active website.

## Themes

Open **Settings → Appearance → Theme** to choose **Default**, the original teal appearance, or **Europa Nuova**, with Europa fonts, orange accents, and one graphic background. Theme choices apply throughout the site, are saved on this device, and return to Default when preferences are reset. Weapon colors and hero badges retain their colors.

## Browse the tracker

1. Use the header navigation to switch between Home, all schedule views, Profile, Find Users, Settings, and FAQ.
2. Choose a view from the table below.
3. Search by hero name or title using **Find a hero**. Use **Hero type** and **Advanced filters** to narrow by type, color, and pool.
4. On dated schedules, use the month slider and navigation buttons to browse months. On **Rerun Waitlist**, scroll horizontally or swipe on mobile; the rows expand as heroes are added.
5. Hover over a hero on desktop for a mini preview. Click or tap to open **Hero Details**, including portrait, name, title, tags, editor note, and update information.
6. Enable **Compact view** for smaller portraits and columns with card tags hidden. Full information remains in previews and Hero Details.

Open pages refresh hero and banner data every 30 seconds while visible, and when returning to the tab or reconnecting. Unsaved forms pause updates. New website versions load automatically when idle, preserving the selected view and month.

**FAQ** opens inside the navigation menu, with searchable schedule explanations and editor instructions for authorized accounts. **Settings â†’ About** contains project information, credits, special thanks, YouTube, X, GitHub, and the install-app control. The footer keeps only the site name, creator credit, and artwork attribution.

### Schedule views

| View | What it tracks |
| --- | --- |
| **Home** | Active banners and dates, using four featured portraits, L/M/E color lanes, or two heroes per color for New Heroes Return / Double Special Heroes. |
| **General Schedule** | The end-of-month banner schedule for Legendary, Mythic, Emblem, and Chosen Heroes. |
| **Remix Schedule** | Older heroes returning on Remix banners, kept separate from General Schedule. |
| **Monthly Revival Schedule** | Older Legendary and Mythic reruns, grouped by month with separate Legendary Revival and Mythic Revival columns. |
| **New Heroes Revival Schedule** | New Heroes revival lineups in a compact month list with up to four portraits. |
| **Hall of Forms Revival Schedule** | Hall of Forms revival lineups in their own compact month list. |
| **Rerun Waitlist** | A manually managed list populated by editors with Add Hero or Choose a Hero. Banner membership does not automatically add or remove entries. |

These are the website's organizational views. A Waitlist entry is not an official promise of a future banner.

### Rerun timing

Dated views show recorded rerun months. Use **Rerun Waitlist** when no month is available. Editor notes provide announcement sources or other context; check in-game notices for final banner dates and availability.

### Hero types, pools, and blessings

Supported specific types are **Legendary, Mythic, Emblem, Chosen, Rearmed, Attuned, Aided, Entwined, Duo, Harmonized, and Vista**.

For heroes without a specific type:

- **General** uses **General Pool**.
- **Special** defaults to **Limited Pool**.

Legendary, Mythic, and Emblem default to **L/M/E Pool**. Rearmed, Attuned, Aided, Entwined, Vista, Chosen, Duo, and Harmonized default to Limited Pool. Editors can choose the pool independently of hero type. Pool labels are tracker groupings; they do not replace the game's banner-specific appearance rates or eligibility.

Legendary and Chosen entries offer Wind, Earth, Fire, and Water tags. Mythic entries offer Anima, Astra, Light, and Dark. Emblem and other types have their own colored tags. General and Special do not require a blessing.

## Homepage banners

Owners and Managers can use **+ Add newâ€¦** on Home to save a banner name, start and end dates, and select existing heroes for its slots. Editors enter UTC dates and times, with FEH defaults of 07:00 for the start and 06:59 for the end. Visitors see these times automatically converted to their local timezone. Ongoing banners appear automatically; upcoming and ended entries remain available to editors. **Edit banner / slots** updates a lineup, and **Create hero in banner** adds a new hero directly. Banner membership does not change the heroâ€™s rerun schedule. Multiple active banners rotate in a looping carousel every 10 seconds, with arrows, slide indicators, swipe support, and a pause control. The active navigation indicator fills over 10 seconds. Rotation pauses with the Pause control, touch interactions, open dialogs, or a hidden tab.

## Add or edit heroes

Editing requires an authorized **Owner** or **Manager** account. Public visitors have read-only access.

1. Open **Owner sign in** and enter your own account email and password manually. Use **Forgot password?** if needed.
2. Choose **Add hero**, or open a hero's details and select its edit action.
3. Select the schedule, hero type, color, pool, and blessing where applicable. Enter the name and title. Check **Demote Â· 4â€“5â˜… summonable** when applicable; this is shown in Hero Details and hover previews.
4. Add a rerun month for a dated entry, or select Rerun Waitlist when no month is available. **Skip next rerun month** also saves the hero to Waitlist when an EoM return is uncertain; homepage banner membership stays intact. To move a waitlisted hero into a dated view, select its schedule and month.
5. Add a portrait and a note explaining the announcement, prediction, or other context.
6. Select **Save hero**. Changes are stored in Supabase and do not require a frontend rebuild.

Monthly Revival accepts Legendary and Mythic entries only. Both the owner and managers can write hero notes. Deleting a hero is also available to authorized editors.

### Portrait uploads

Use **PNG, JPG, or WebP**, up to **3 MB**. You can choose a file, drag and drop an image, or paste a copied image into the editor.

Direct HTTPS image links from supported FEH Wiki / Fandom / Wikia or Wikimedia hosts can be imported. Paste the image URL, not the wiki article URL, and wait for the preview. If a host blocks import, download the image and upload the file instead.

### Manager access

Only the owner can manage editor access through **Managers**. A manager must already have a confirmed Supabase Authentication account before the owner adds its email. The panel does not create accounts or send invitations. Managers sign in with their own credentials.

See [Owner and Managers setup](supabase/MANAGERS.md) for authorization details.

## Install on a phone

Use **Install app** in **Settings â†’ About**:

- **Android:** Open in Chrome and use the install prompt when available, or the browser's Install app / Add to Home screen option.
- **iPhone / iPad:** Open in Safari, choose Share â†’ Add to Home Screen, and enable Open as Web App if offered.

Installation adds a home-screen icon and standalone window. An internet connection is needed for current schedules and editing. Offline mode provides a reconnect screen rather than a cached schedule.

## Hosting and development

The frontend uses **React, TypeScript, and Vite** on **GitHub Pages**. **Supabase** provides the database, sign-in, portrait storage, and image import. The tracker is publicly viewable; only the owner and authorized managers can edit.

Pushes to `main` automatically check, build, and deploy through [GitHub Actions](https://github.com/clustifle/FEH-Rerun-Schedule-by-Clustifle/actions). Hero edits are saved directly to Supabase without rebuilding the website.

For local development, use **Node 24** and **pnpm 11**:

```sh
pnpm install --frozen-lockfile
pnpm dev:pages
```

To check and build:

```sh
pnpm exec tsc -p tsconfig.pages.json
pnpm build:pages
```

The active frontend is in `pages-app/`, styles are in `app/globals.css`, and assets are in `public/`. Backend setup and migrations are in `supabase/`; see [Owner and Managers](supabase/MANAGERS.md) for editor access. Historical migrations should not be rerun on the live database without review. Keep passwords, secret keys, and service-role keys out of the repository.

## Credits

- **Website, design, and tracker:** Clustifle Â© 2026.
- **Fire Emblem Heroes and artwork:** Â© Nintendo / INTELLIGENT SYSTEMS.
- **Typography:** Champions font from UEFA. Font assets remain subject to their respective rights and licenses.
- **Information references:** [Official FEH news](https://fire-emblem-heroes.com/en/topics/), [Learn with Sharena](https://new-guide.fire-emblem-heroes.com/en-US/feh-1170.html), and [Fire Emblem Heroes Wiki](https://feheroes.fandom.com/). Specific references are linked in the website's FAQ.
- **Project history:** Originally created with ChatGPT Sites; migrated to GitHub Pages and Supabase.

This is an unofficial fan website, unaffiliated with Nintendo or INTELLIGENT SYSTEMS. Artwork, branding, fonts, and third-party dependencies retain their respective rights. No blanket license is granted for those assets by this README.

For a missing entry or correction, include the hero's name and title, schedule, month if known, and announcement source when contacting Clustifle through the linked social pages or reporting it in this repository.
