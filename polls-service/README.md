# Community polls service

Cloudflare Workers and D1 store polls and votes. Authentication uses the registered website account: the Worker verifies its access token through Supabase Auth and checks the existing `tracker_role` RPC. Head Admin and Schedule Managers can manage polls without a separate GitHub login. Staff roles are managed through the existing website Mods Tool.

Managers can create and review drafts, publish polls, close voting, archive polls, feature open polls on Home, and export aggregate results. Voting requires a registered, nonanonymous website account with a verified GitHub identity. Votes remain unique per GitHub account across linked website accounts. Published questions, choices, and voting rules are locked. Individual voter identities are never returned by the API.

## Deployment

Use Node 24 and the repository's Wrangler installation. The configured Worker is `feh-community-polls`; its D1 binding and public settings are in `wrangler.jsonc`.

For a new database, install `schema.sql`. For databases created before browser nonce binding was added, apply `migrations/002-login-browser-binding.sql` once instead. Do not apply that migration after the current fresh schema.

Set `GITHUB_CLIENT_SECRET` as an encrypted Worker secret. Never put it in source control. The GitHub OAuth application must allow the Worker's `/auth/callback` URL. Keep any existing website callback configured.

Run `node --test polls-service/worker.test.mjs` before deploying with `wrangler deploy --config polls-service/wrangler.jsonc`. GitHub Pages deploys the frontend separately. Its service URL is in `pages-app/poll-config.json`.

The original independent OAuth endpoints and session tables are retained for compatibility, but separate poll login is disabled when website authentication is configured. Website access tokens are verified per request and never stored in D1. Only the public Supabase key is configured; no service-role key is used. A scheduled cleanup removes expired legacy authentication and rate-limit records. Deadlines and access checks are enforced by the service.

## Private forum drafts

Apply `migrations/003-private-forum-drafts.sql` to an existing forum database before deploying the draft API; `community-schema.sql` includes it for fresh forum installs. The migration only adds `community_drafts`. A direct `wrangler d1 execute --command` can apply its single statement if file imports are unavailable.

`GET /community/draft`, `POST /community/draft`, and `DELETE /community/draft` operate on the verified website account only. No account ID supplied by a client selects the owner, and responses are never publicly cached. A draft contains title, body, category and flair; incomplete drafts are allowed within the existing post limits. Writes and clears require the last observed revision. A stale revision returns 409 with only that account's current draft. Clearing retains a revision marker to prevent old devices silently reviving published text.

The main forum composer keeps one working new-post draft per account, saves locally immediately, and syncs after a short typing pause. Opening the composer, focusing the page, reconnecting, or choosing Sync now refreshes it. Visible composers also check every 15 seconds. Conflicts preserve the current text until the user chooses either version. Existing device drafts are imported when there is no conflicting cloud draft. Editing a published post continues to use explicit publishing. Successful publication clears only matching draft text and revision; cleanup failures are retried safely on the next composer visit.

Run `node --test scripts/forum-draft-sync.test.mjs polls-service/community.test.mjs polls-service/worker.test.mjs polls-service/request-body.test.mjs` plus `scripts/forum-draft-ui-check.mjs` against the local Pages preview to verify ownership, stale saves, offline recovery, two-device conflicts and publish cleanup without making public posts.

## SR / SHSR eligibility ranges

Apply `migrations/004-special-rate-settings.sql` before deploying configurable pool ranges. The table is also included in fresh `community-schema.sql` installs. With no saved row, defaults remain SR v1.0–v8.7 and SHSR v1.0–v7.1, including the existing release-date fallbacks.

`GET /community/pool-ranges` returns public eligibility rules, revision and update time. Only verified website Head Admin and Schedule Manager accounts may `POST /community/pool-ranges` with `{ranges,revision}`. Inputs are bounded, version ranges are compared numerically, and stale saves return 409. The updater account is stored internally and is never included in the public response.

Administrative Manager → Mods Edit → SR / SHSR ranges provides inclusive first/last versions, fallback dates for missing version metadata, counts and a changed-label preview. Defaults are loaded into the form for review and require an explicit save. A failed initial read disables saving. Private beta cannot change live ranges. Main-site pool labels and filters subscribe to the shared rules, refreshing on focus/reconnection and once per minute while visible. Existing hero records are not rewritten, and demote, Grail, starter and limited-type exclusions remain enforced.
