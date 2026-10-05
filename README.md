# Fire Emblem Heroes Rerun Schedule

<p align="center">
  <img src="public/clustifle-feh-rerun-logo.png" width="420" alt="Fire Emblem Heroes Rerun Schedule by Clustifle">
</p>

An independent fan project by **Clustifle** for browsing Fire Emblem Heroes rerun schedules, active summoning banners, and revival lineups.

**[Visit the website](https://clustifle.github.io/FEH-Rerun-Schedule-by-Clustifle/)** · [Report an issue](https://github.com/clustifle/FEH-Rerun-Schedule-by-Clustifle/issues) · [Deployment status](https://github.com/clustifle/FEH-Rerun-Schedule-by-Clustifle/actions)

## Overview

The website brings several schedule views into one interface, with hero portraits, searchable lineups, local banner times, and tools for authorized schedule editors. Visitors can browse without an account. Signed-in users can customize a public profile and use personal tracking features.

The frontend is built with **React, TypeScript, and Vite** and hosted on **GitHub Pages**. **Supabase** provides authentication, schedule data, and image storage.

## Schedule views

| View | Purpose |
| --- | --- |
| **Home** | Currently active banners, featured heroes, active dates, and time remaining. |
| **General Schedule** | Recorded end-of-month reruns for Legendary, Mythic, Emblem, and Chosen Heroes. |
| **Remix Schedule** | Hero reruns associated with Remix banners. |
| **Monthly Revival Schedule** | Legendary and Mythic revival entries, grouped by month. |
| **New Heroes Revival Schedule** | Returning New Heroes lineups, including Forging Bonds revivals, in a compact month list. |
| **Hall of Forms Revival Schedule** | Hall of Forms revival lineups in a separate month list. |
| **Rerun Waitlist** | A list maintained manually by editors for heroes awaiting a recorded rerun. |

Schedule entries reflect information recorded by the site's editors. A listed month or waitlist entry does not guarantee a future banner; consult in-game announcements for confirmed dates, lineups, and availability.

## Browsing and personalization

- **Search and filters:** Find heroes by name or title and narrow results by hero type, weapon color, and pool.
- **Hero information:** Hover over a portrait on desktop for a quick preview, or select it to open the full Hero Details view.
- **Month navigation:** Browse dated schedules with the month strip and return to the present using **Current month**.
- **Compact view:** Reduce portrait and column sizes on supported schedules while keeping full information available in Hero Details.
- **Automatic updates:** Schedule data refreshes every 30 seconds while the page is visible, subject to update preferences. Open editing forms pause refreshes.

**Settings** contains appearance, navigation, carousel, motion, date and time, and update preferences. Preferences are saved on the current device. **FAQ** provides searchable explanations of the site's schedules and banner types, with additional instructions for authorized editors. Both panels scroll independently of the navigation controls.

### Themes

Choose a theme under **Settings → Appearance → Theme**:

| Theme | Appearance |
| --- | --- |
| **Default** | The original teal design with Champions typography. |
| **Energy Wave** | Europa typography, orange accents, one graphic background, and transparent gradient navigation. |

Themes apply throughout the site, including banner cards, hover previews, and editors. Weapon-color rows and hero badges retain their identifying colors. **Reset settings** restores the Default theme and other device preferences.

### Banner layouts and times

Home uses three banner layouts:

- **Legendary / Mythic / Emblem:** Hero lineups arranged in weapon-color rows.
- **New Heroes / Special Heroes:** Four featured portraits with names highlighted in their weapon colors.
- **New Heroes Return / Double Special Heroes:** Up to two heroes per weapon color.

Multiple active banners appear in a looping carousel with manual navigation, a filling progress indicator, and a pause control. Its default interval is 10 seconds and can be changed in Settings.

Editors enter dates and times in UTC. The default start time is **07:00 UTC**, and the default end time is **06:59 UTC** on the selected end date. Visitors see banner times in their local timezone unless they choose UTC in Settings.

### Hero pools

The tracker distinguishes **General Pool**, **Non-Seasonal Limited**, **Seasonal Limited**, and **L/M/E Pool**. Editors can select a pool independently of hero type. These labels organize the tracker; the actual summoning banner determines eligibility and appearance rates.

## Accounts and editor access

Email sign-in and account creation are available from the navigation menu. Creating an account does not grant schedule-editing access.

After signing in, accounts without a completed identity enter a required fullscreen profile setup. A display name and unique username are required; a picture, bio, social link, and Fire Emblem favorites are optional. Setup drafts resume on the same browser, except unsubmitted picture files. Existing profiles with a valid name and username remain available. The setup follows the selected theme and reduced-motion preference.

| Role | Access |
| --- | --- |
| **Visitor** | Browse schedules and personalize the interface. Signed-in visitors can manage their profile and personal tracking. |
| **Schedule Manager** | Create and edit heroes, banners, waitlist entries, and revival lineups. |
| **Head Administrator** | All editing capabilities, plus management of Schedule Manager access. |

Account and profile controls are available in **Settings → Account** after signing in. Public profiles support a username, display name, picture, bio, social links, and optional favorites. Usernames form shareable links such as `/profile/clustifle`; **Find Users** searches public usernames and display names.

The Head Administrator grants editor access through **Manage Schedule Managers**. The selected user must already have a confirmed account. See the [backend editor-access guide](supabase/MANAGERS.md) for implementation details; its internal role identifiers retain the older Owner and Manager names.

## Editing schedules

Authorized editors can use **Add Hero**, edit a hero from its details, or select an existing portrait through **Choose a Hero**. Hero records include a name, title, type, weapon color, pool, applicable blessing, portrait, and editor note. The **Demote** option identifies a 4–5-star summonable demote hero.

Use a recorded month for a dated schedule. **Skip next rerun month** supports entries whose next return is uncertain. The **Rerun Waitlist** is managed explicitly: adding a hero to a banner or revival lineup does not automatically add or remove its waitlist entry.

On Home, **Add new…** creates a banner; **Edit banner / slots** changes its identity, dates, and lineup. Revival editors support up to four heroes and a **Currently ongoing** option for displaying time remaining during the configured active period.

Changes are saved directly to Supabase and do not require a frontend deployment.

### Hero portraits

The hero editor accepts **PNG, JPG, and WebP** files up to **3 MB** through upload, drag and drop, or paste. Direct HTTPS image links from supported Fandom/Wikia and Wikimedia hosts can also be imported.

Small portraits are enlarged with conventional image smoothing to a maximum 1024-pixel longest edge. This preserves composition, aspect ratio, and transparency; it does not generate additional artwork detail.

## Local development

Use **Node.js 24** and **pnpm 11**, matching the deployment workflow.

```sh
git clone https://github.com/clustifle/FEH-Rerun-Schedule-by-Clustifle.git
cd FEH-Rerun-Schedule-by-Clustifle
pnpm install --frozen-lockfile
pnpm dev:pages
```

Open the local URL printed by Vite. To check types and create the GitHub Pages build:

```sh
pnpm exec tsc -p tsconfig.pages.json
pnpm build:pages
```

The build output is written to `pages-dist/`.

### Project structure

| Path | Contents |
| --- | --- |
| [`pages-app/`](pages-app/) | Active GitHub Pages frontend and Supabase integration. |
| [`app/globals.css`](app/globals.css) | Shared layout and interface styles. |
| [`app/themes.css`](app/themes.css) | Theme assets, typography, and appearance overrides. |
| [`public/`](public/) | Logos, fonts, theme backgrounds, and installable-app assets. |
| [`supabase/`](supabase/) | Backend configuration, migrations, and editor-access documentation. |
| [`.github/workflows/pages.yml`](.github/workflows/pages.yml) | Type checks, production build, and GitHub Pages deployment. |

The active frontend's Supabase connection is configured in [`pages-app/static-data.ts`](pages-app/static-data.ts). Use a separate backend when developing changes that write stored data. Keep private credentials and service-role keys out of the repository.

The repository also retains files from the project's original ChatGPT Sites implementation. The GitHub Pages application uses the `dev:pages` and `build:pages` commands above.

## Deployment

Pushes to `main` run the GitHub Actions deployment workflow. It checks TypeScript, builds the frontend, and publishes `pages-dist/` to GitHub Pages. Schedule and profile changes made through the website are stored in Supabase and do not require this workflow.

## Feedback and contributions

For a missing entry or schedule correction, include the hero's name and title, the relevant schedule, the month if known, and an announcement source. For interface bugs, include the affected page, browser or device, reproduction steps, and a screenshot where useful.

Use [GitHub Issues](https://github.com/clustifle/FEH-Rerun-Schedule-by-Clustifle/issues) for reports. Code contributions should explain the change and include relevant validation; frontend changes should pass the type check and GitHub Pages build.

## Credits

- **Website, design, and development:** Clustifle.
- **Special thanks:** [u/King41bert0713](https://www.reddit.com/user/King41bert0713/) for helping with additions during development.
- **Fire Emblem Heroes artwork:** © Nintendo / INTELLIGENT SYSTEMS.
- **Typography and Europa theme graphics:** UEFA brand assets, retaining their respective ownership and licensing terms.
- **Information sources:** In-game announcements, official Fire Emblem Heroes notices, and community references linked in the site's FAQ.

Project information and social links are available in **Settings → About**, including [YouTube](https://www.youtube.com/@Clustifle) and [X](https://x.com/Clustifle). Where supported, this section also provides **Install app**; current schedules and editing require an internet connection.

This is an unofficial fan project and is not affiliated with Nintendo or INTELLIGENT SYSTEMS. Third-party artwork, branding, fonts, and dependencies remain subject to their respective rights and licenses.
