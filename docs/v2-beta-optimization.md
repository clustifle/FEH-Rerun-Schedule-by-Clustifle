# Version 2.0 beta optimization check

Checked 9 October 2026. Changes remain on the private beta branch.

## Fixes

- Compact the manager's hero picker and waitlist reorganizer at narrow, short phone sizes. Keep a usable hero list and visible actions.
- Increase touch controls to at least 44px in the mobile manager.
- Apply the FE Heroes font and white header to the manager's signed-out screen.
- Remove solid teal button backgrounds underneath transparent FEH sprites in both the manager and the beta website.
- Load bulk editing, version management, and the manager's hero editor when opened; show a recovery message if a tool fails to load.
- Fetch beta waitlist memberships once per refresh and share concurrent hero reads.
- Stop stalled beta requests after 15 seconds, with an actionable error. Preserve server validation errors and do not automatically retry writes.

## Validation

- TypeScript checks and production builds.
- 26 Worker tests: private access, role enforcement, cross-origin writes, watchlist isolation, hero validation, stale edits, versions, waitlists, and ordering.
- 48 main-site route/width combinations: 12 routes at 320, 360, 390, and 768px. Includes home, heroes, FAQ, account/appearance settings, schedules, waitlist, watchlist, and community. No document-width overflow or uncaught page errors in these mocked-data checks.
- Hero profile pinning and scrolling; watchlist grid/list/icons; bulk edits and required blessings; version rename/reassignment/deletion; multi-selection; manager navigation, dialogs, saving, and closing.
- Manager dialogs additionally checked at 320×568, including a visual check of the hero picker.
- Client request tests verify shared reads, server errors, and timeout recovery.
- Production-build checks confirm transparent FEH sprite buttons in all 11 website themes, including hover, at 320px and 1280px. The built standalone manager passes its editing and short-screen dialog checks as well.

Initial manager JavaScript measured 523.09 KB before deferred tools and approximately 494 KB afterward (uncompressed). Deferred tool code is still downloaded when used.

## Release boundary

This is an interface and client optimization pass using simulated accounts and records. It does not validate a new live GitHub authorization round trip, modify production data, or publish version 2.0. Private beta access remains restricted to verified Head Admin accounts. Community forum activation and beta-disabled live management services still need their separate release work.
