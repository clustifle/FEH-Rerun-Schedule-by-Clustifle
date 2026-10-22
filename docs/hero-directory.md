# All Heroes directory

## v3.0 directory improvements

Search also covers weapon color/type, movement, blessing, debut version, release date, aliases and the derived summoning pool. For example, `green tome infantry` combines metadata terms while retaining accent-insensitive name matching. Release date and debut version can be sorted newest/oldest, with missing values last.

Waitlists and Schedule Under Consideration display `Date not confirmed` instead of presenting their stored month as a recorded rerun. Those entries are excluded from dated rerun sorting and remain grouped with undated heroes. These changes do not alter hero records or schedules.

Focused checks: `node --test scripts/directory-data.test.mjs`.

The compact toolbar combines name/title/type/note search, sorting, a seven-option view selector, filters and Add Hero. Filters retain category, color, weapon, movement, pool, schedule, blessing, demote and debut-version controls. Active filters can be removed individually or reset together.

Views: Small icons (44 px), Medium icons (64 px), Large icons (96 px), List (40 px rows), Details (table), Tiles (72 px portrait entries), and Content (expanded rows). The selected view is remembered in local browser preferences. Hero profile links and hover previews work in every view. Search ignores common accents and transliterates FEH special letters. Compact labels truncate without changing accessible hero names.

Only results scroll; the toolbar stays visible. Mobile keeps the search full width and places sort/view/filter controls together. Legacy mobile directory rules exclude the new workspace to prevent layout conflicts. Entries use intrinsic grid row sizing so portraits cannot be squeezed by the scrolling container.

Checks: scripts/all-heroes-views-check.mjs covers all views, image sizes, portrait containment, mobile overflow, toolbar width, search, persistence and derived pool filtering.

Performance: the directory indexes normalized search text once per dataset and sorts only when data or sort order changes. Search input uses deferred filtering to keep typing responsive. Views use bounded result pages with keyboard-accessible Previous and Next controls. Counts and filters always include the full dataset. Offscreen entries skip painting where supported. Concurrent catalog reads share their in-flight request without retaining a stale cache.

Monthly and Weekly Revival timers pause while the page is hidden, refresh when it returns, and use second updates only within the final day of a banner boundary.

On devices reporting at most 4 GB memory or eight CPU threads, and on coarse-pointer touch devices, the directory uses smaller result pages. Limited desktop pages contain 96 heroes; touch pages contain 48. Search, filters and counts still use every hero. This uses optional browser capability hints, with no user-agent detection or telemetry. Limited devices also omit backdrop blur on dialog overlays and retain at most 12 short-lived hover skill cache entries.

All devices use bounded result pages (120 standard, 96 limited desktop, 48 touch). Page changes release the previous result nodes. Visible rows and their rendered elements are memoized so immediate search input changes can reuse the current result tree until deferred filtering finishes. All seven views use flat entries instead of card borders and surfaces.
