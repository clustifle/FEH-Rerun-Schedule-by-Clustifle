# Monthly Legendary/Mythic Revivals

Open /schedule/monthly-revival/. Schedule and Banner Directory reuse the Weekly Revival interface and theme styling.

- 8 Legendary and 5 Mythic reusable lineups were linked to existing heroes from the supplied list. Roster labels include Robin (F), Corrin (F), Tiki (Y), Vallite Songstress, and Sweet Dreams.
- Legendary and Mythic have separate directory tabs, searchable names/numbers, profile links, and lineup/appearance editors.
- Existing unanimous Monthly Revival assignments were preserved as 10 month-only appearances. No exact dates or durations were inferred. The three undated lineups have no appearance until staff adds one.
- Appearance month can be stored without dates. Exact dates require a positive whole-number duration. 28 and 35 days are quick presets; custom durations are supported.
- Start is 07:00 UTC; stored end is 06:59:59 UTC after the chosen duration. Cards show the last active day and the actual end date.
- Schedule Under Consideration is a checkbox. Its month is optional, and exact dates are omitted.
- Add banner can optionally schedule an appearance at the same time. Add/Edit appearances is available from directory details and schedule cards. Status is derived from exact dates.
- Only Head Admin and Schedule Managers can write, through the existing is_tracker_owner() predicate. RLS and explicit grants protect both new tables; revision checks detect concurrent edits.
- Share/export and the hidden combined export read monthly appearance records, including manually updated months. Monthly consideration heroes are included in the combined consideration panel.
- Original hero rows and older monthly assignments remain intact; the new page uses the reusable banner records.

Database schema and seeded roster lookup: supabase/monthly-revivals.sql.
Browser verification: scripts/monthly-revivals-ui-check.mjs and scripts/schedule-export-ui-check.mjs.
Database checks run in a rolled-back transaction: valid exact-date records and positive duration validation, public read, and unprivileged insert denial. Security advisor reported no findings on the new tables/function.

Adjustable-duration update: supabase/monthly-revival-adjustable-duration.sql replaces the initial duration restriction. Ongoing cards show the next recorded future month, or Next rerun: Not announced. The current appearance is retained separately; staff adds a new appearance when its next rerun is announced. Tests cover custom 31/32-day runs and ongoing editing without a future rerun.

Local-time and export update: exact start/end instants are displayed in the viewer's local timezone. The start-date editor converts local calendar dates back to the stored UTC FEH reset date, including previous-day timezones. Month-only assignments retain their announced month.
Exports preserve each numbered banner's hero order, show one panel per month with Legendary/Mythic lineups stacked vertically, and group consideration heroes by their banner rather than weapon color. This applies to standalone and combined exports. Tests include Bangkok, Los Angeles winter date rollover, and mixed-color lineup placement.
