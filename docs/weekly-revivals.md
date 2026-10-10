# Weekly Revivals

Open Schedule > Weekly Revivals, or `/schedule/weekly-revivals/`.

This page is independent of the Monthly Legendary/Mythic Revival schedule.

- Schedule shows the selected month's appearances, including active events and separately labelled unconfirmed dates.
- Banner Directory supports number/name search, paginated cards, profile links, and a selected banner's recorded appearances.
- The initial catalog has slots #1–#109. Slots without a verified lineup explicitly show “Lineup not added”. No sample lineups or dates are published.
- Head Admin and Schedule Managers can configure three distinct existing heroes, add further positive banner numbers, and add/edit/remove dates and optional HTTPS source links.
- A banner must have a complete lineup before staff adds an appearance. Multiple appearances reuse that lineup. Removing a banner with appearances is blocked until its appearances are removed.
- Ordinary members and visitors can read the catalog and schedule, but cannot write to their tables. Database policies enforce this restriction.
- Edits check record revisions to avoid overwriting another staff member's changes.
- Dates use the game's UTC reset: 07:00 start and 06:59:59 end. Month navigation is independent from the other schedule boards.

Database setup is recorded in `supabase/weekly-revivals.sql`. Browser checks are in `scripts/weekly-revivals-ui-check.mjs` and use mocked sample data, never real published events.
