# Public data availability on the Free plan

The GitHub Pages deployment runs at 01:23, 09:23 and 17:23 UTC each day, as well as after main changes and manual runs. It reads public hero, banner, revival and waitlist records anonymously, then publishes a complete snapshot with the site. These database reads generate genuine activity, but the Free plan still has no guarantee against pausing.

Only tables and fields explicitly listed in `lib/public-snapshot-tables.json` are exported. No service key, user profiles, accounts, watchlists, collections, drafts, staff history or personal tracking data are included. Returned data is projected back onto the approved field list before writing.

The browser tries live public data first. Network errors, timeouts, rate limits and server failures can fall back to the saved snapshot. Permission errors, account requests and all writes remain live-only. Administrative routes do not use the fallback. A notice shows the saved-data timestamp when fallback is active.

If refreshing fails, deployment retains the last complete snapshot from the runner cache or current public deployment. It fails rather than publishing an empty replacement when neither exists. Portrait delivery remains on GitHub Pages using the existing portrait sync.

Check the Deploy GitHub Pages workflow for failed scheduled runs. GitHub schedules can be delayed and public-repository schedules can be disabled after 60 days without repository activity; re-enable the workflow in Actions if necessary. If Supabase is already paused, resume it in its dashboard. A scheduled read cannot restore a paused project.

References: https://supabase.com/docs/guides/platform/free-project-pausing and https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule
