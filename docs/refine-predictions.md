# Refine Predictions — final design

Route: `schedule/refine-predictions`, available under Schedule in the header.

The default view shows this month's sourced Announced/Released refines first, followed by monthly predictions. The page uses the existing FEH title ribbon, theme colors, flat rows, compact portraits and thin separators. There are no individual hero cards or full weapon descriptions.

Views: This month + upcoming, Predictions, Waiting list, History. Search covers hero name/title, weapon and update version; category filtering is independent of summoning-pool cutoff settings. Hero portraits open existing Hero Profiles and use the shared hover preview. Sources and short notes live in compact disclosures.

Staff can add existing heroes, choose a prediction group, month, weapon name, status and short reason. Predicted, Alternative, Announced, Released, Unscheduled and Skipped/uncertain remain distinct. Announced/Released require an HTTPS source. Predictions never become confirmed merely because their month passes. Passed prediction months are flagged for review. Released batches move into History when the visitor's local month advances.

The editor is a private draft until Save schedule. Native month-drop targets, keyboard reorder buttons, and the entry month field support moving candidates. Staff may edit the future order manually. No automatic model or fabricated probabilities are included in this first release. No prediction creates a weapon, skill icon or refinement effect in the Skills List.

The public board is stored in Cloudflare D1; only verified website Head Admins and Schedule Managers can write. Forum posting authorization is not required. Revision checks reject stale writes and keep the open draft for review. The public response does not expose the staff updater ID. Existing hero and banner records remain independent.

The first published batch is October 2026 (v10.10), seven released heroes: Hilda: Deer's Two-Piece; Cath: Master Thief; Idunn: Divine Demon; Galzus: Dark Blade of Od; Holst: Hero of Leicester; Alear: Awoken Divinity; Ike: Of Radiance. Weapon names were checked against the hero pages' Weapons tables. The batch date and membership are supported by [Medhaos's October 6 roundup](https://thesummoningstonebook10.wordpress.com/2026/10/06/refine-roundup-october-2026/). Seed entries contain source links. Future predictions and waiting entries are initially empty, ready for staff curation; sample mockup candidates are not published.

Exports use the current view and filters, preserve every status label, identify predictions as estimates, and generate a 4K PNG using existing game portraits, frame, logo and FEH wallpaper texture. Up to 200 entries may be exported at once to bound canvas memory.

References: [Nintendo Weapon Refinery guide](https://new-guide.fire-emblem-heroes.com/en-US/feh-2270.html), [FEHology observed prediction methodology](https://fehology.com/fire-emblem-heroes-refine-predictions/). Observed patterns are not official scheduling rules.
