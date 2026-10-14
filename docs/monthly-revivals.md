# Monthly Legendary/Mythic Revivals

Open /schedule/monthly-revival/. Schedule and Banner Directory reuse the Weekly Revival interface and theme styling.

- 8 Legendary and 5 Mythic reusable lineups were linked to existing heroes from the supplied list. Roster labels include Robin (F), Corrin (F), Tiki (Y), Vallite Songstress, and Sweet Dreams.
- Legendary and Mythic have separate directory tabs, searchable names/numbers, profile links, and lineup/appearance editors.
- Existing unanimous Monthly Revival assignments were preserved as 10 month-only appearances. No exact dates or durations were inferred. The three undated lineups have no appearance until staff adds one.
- Appearance month can be stored without dates. Exact dates require a 28-day or 35-day duration; 7-day and 30-day runs are rejected by database constraints.
- Start is 07:00 UTC; stored end is 06:59:59 UTC after the chosen duration. Cards show the last active day and the actual end date.
- Schedule Under Consideration is a checkbox. Its month is optional, and exact dates are omitted.
- Add banner can optionally schedule an appearance at the same time. Add/Edit appearances is available from directory details and schedule cards. Status is derived from exact dates.
- Only Head Admin and Schedule Managers can write, through the existing is_tracker_owner() predicate. RLS and explicit grants protect both new tables; revision checks detect concurrent edits.
- Share/export and the hidden combined export read monthly appearance records, including manually updated months. Monthly consideration heroes are included in the combined consideration panel.
- Original hero rows and older monthly assignments remain intact; the new page uses the reusable banner records.

Database schema and seeded roster lookup: supabase/monthly-revivals.sql.
Browser verification: scripts/monthly-revivals-ui-check.mjs and scripts/schedule-export-ui-check.mjs.
Database checks run in a rolled-back transaction: valid 28/35-day records, rejection of 7/30 days, public read, and unprivileged insert denial. Security advisor reported no findings on the new tables/function.
