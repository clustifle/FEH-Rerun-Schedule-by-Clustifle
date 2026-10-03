# Fire Emblem Heroes: Rerun Tracker

**Website made by Clustifle** — an unofficial, publicly accessible tracker for hero reruns.

[Open the tracker](https://clustifle.github.io/FEH-Rerun-Schedule-by-Clustifle/) · [YouTube](https://www.youtube.com/@Clustifle) · [Twitter / X](https://x.com/Clustifle)

The website was originally made on ChatGPT Sites and later migrated to GitHub Pages with Supabase. The original Sites deployment has been removed. GitHub Pages is the active website.

## Browse the tracker

1. Click the schedule heading at the top to open the schedule selector.
2. Choose a view from the table below.
3. Search by hero name or title using **Find a hero**. Use **Hero type** and **Advanced filters** to narrow by type, color, rerun status, and pool.
4. On dated schedules, use the month slider and navigation buttons to browse months. On **Rerun Waitlist**, scroll horizontally or swipe on mobile; the rows expand as heroes are added.
5. Hover over a hero on desktop for a mini preview. Click or tap to open **Hero Details**, including portrait, name, title, tags, editor note, and update information.
6. Enable **Compact view** for smaller portraits and columns with card tags hidden. Full information remains in previews and Hero Details.

The footer contains **FAQ Help**, with searchable explanations and source links, and **About this page**, with credits.

### Schedule views

| View | What it tracks |
| --- | --- |
| **General Schedule** | The end-of-month banner schedule for Legendary, Mythic, Emblem, and Chosen Heroes. |
| **Remix Schedule** | Older heroes returning on Remix banners, kept separate from General Schedule. |
| **Monthly Revival Schedule** | Older Legendary and Mythic reruns, grouped by month with separate Legendary Revival and Mythic Revival columns. |
| **Rerun Waitlist** | Heroes awaiting a recorded rerun month, including New Heroes and Special Heroes banner entries. No month is assigned in this view. |

These are the website's organizational views. A Waitlist entry is not an official promise of a future banner.

### Rerun status

| Status | Meaning in this tracker |
| --- | --- |
| **Confirmed** | An editor has recorded announced information. |
| **Predicted** | An expected return based on patterns or an informed guess. |
| **Uncertain** | Information or timing remains doubtful. |
| **Unknown** | No rerun timing is recorded. Selecting this status switches the hero to Rerun Waitlist; saving clears the month. |

Months identify rerun windows rather than exact start dates. Entries are maintained manually by the owner and managers. Check in-game announcements for final dates, lineups, and summoning availability.

### Hero types, pools, and blessings

Supported specific types are **Legendary, Mythic, Emblem, Chosen, Rearmed, Attuned, Aided, Entwined, Duo, Harmonized, and Vista**.

For heroes without a specific type:

- **General** uses **General Pool**.
- **Special** defaults to **Limited Pool**.

Legendary, Mythic, and Emblem default to **L/M/E Pool**. Rearmed, Attuned, Aided, Entwined, Vista, Chosen, Duo, and Harmonized default to Limited Pool. Editors can choose the pool independently of hero type. Pool labels are tracker groupings; they do not replace the game's banner-specific appearance rates or eligibility.

Legendary and Chosen entries offer Wind, Earth, Fire, and Water tags. Mythic entries offer Anima, Astra, Light, and Dark. Emblem and other types have their own colored tags. General and Special do not require a blessing.

## Add or edit heroes

Editing requires an authorized **Owner** or **Manager** account. Public visitors have read-only access.

1. Open **Owner sign in** and enter your own account email and password manually. Use **Forgot password?** if needed.
2. Choose **Add hero**, or open a hero's details and select its edit action.
3. Select the schedule, hero type, color, status, and blessing where applicable. Enter the name and title.
4. Add a rerun month for a dated entry, or choose Unknown to place it in Waitlist. To move an Unknown hero back to a dated schedule, first choose another status, then select a schedule and month.
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

Use **Install app** in the footer:

- **Android:** Open in Chrome and use the install prompt when available, or the browser's Install app / Add to Home screen option.
- **iPhone / iPad:** Open in Safari, choose Share → Add to Home Screen, and enable Open as Web App if offered.

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

- **Website, design, and tracker:** Clustifle © 2026.
- **Fire Emblem Heroes and artwork:** © Nintendo / INTELLIGENT SYSTEMS.
- **Typography:** Champions font from UEFA. Font assets remain subject to their respective rights and licenses.
- **Information references:** [Official FEH news](https://fire-emblem-heroes.com/en/topics/), [Learn with Sharena](https://new-guide.fire-emblem-heroes.com/en-US/feh-1170.html), and [Fire Emblem Heroes Wiki](https://feheroes.fandom.com/). Specific references are linked in the website's FAQ.
- **Project history:** Originally created with ChatGPT Sites; migrated to GitHub Pages and Supabase.

This is an unofficial fan website, unaffiliated with Nintendo or INTELLIGENT SYSTEMS. Artwork, branding, fonts, and third-party dependencies retain their respective rights. No blanket license is granted for those assets by this README.

For a missing entry or correction, include the hero's name and title, schedule, month if known, and announcement source when contacting Clustifle through the linked social pages or reporting it in this repository.
