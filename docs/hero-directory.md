# All Heroes directory

The compact toolbar combines name/title/type/note search, sorting, a seven-option view selector, filters and Add Hero. Filters retain category, color, weapon, movement, pool, schedule, blessing, demote and debut-version controls. Active filters can be removed individually or reset together.

Views: Small icons (44 px), Medium icons (64 px), Large icons (96 px), List (40 px rows), Details (table), Tiles (72 px portrait cards), and Content (expanded rows). The selected view is remembered in local browser preferences. Hero profile links and hover previews work in every view. Search ignores common accents and transliterates FEH special letters. Compact labels truncate without changing accessible hero names.

Only results scroll; the toolbar stays visible. Mobile keeps the search full width and places sort/view/filter controls together. Legacy mobile directory rules exclude the new workspace to prevent layout conflicts. Cards use intrinsic grid row sizing so portraits cannot be squeezed by the scrolling container.

Checks: scripts/all-heroes-views-check.mjs covers all views, image sizes, portrait containment, mobile overflow, toolbar width, search, persistence and derived pool filtering.

Performance: the directory indexes normalized search text once per dataset and sorts only when data or sort order changes. Search input uses deferred filtering to keep typing responsive. Views render the first 120 results, adding 120 as the scroll boundary approaches; a keyboard-accessible Show more heroes button also advances the list. Counts and filters always include the full dataset. Offscreen cards skip painting where supported. Concurrent catalog reads share their in-flight request without retaining a stale cache.

Monthly and Weekly Revival timers pause while the page is hidden, refresh when it returns, and use second updates only within the final day of a banner boundary.

On devices reporting at most 4 GB memory or eight CPU threads, and on coarse-pointer touch devices, the directory uses bounded page navigation instead of accumulating cards. Desktop batches contain 96 heroes; touch batches contain 48. Search, filters and counts still use every hero. This uses optional browser capability hints, with no user-agent detection or telemetry. Limited devices also omit backdrop blur on dialog overlays and retain at most 12 short-lived hover skill cache entries.
