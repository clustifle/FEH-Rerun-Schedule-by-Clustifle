# Community polls service

Cloudflare Workers and D1 store polls independently of Supabase. GitHub sign-in verifies each voter. Head Admin grants Schedule Managers access under **Poll staff**, using their numeric GitHub account ID. These permissions are separate from website staff roles.

Managers can create and review drafts, publish polls, close voting, archive polls, feature open polls on Home, and export aggregate results. Only Head Admin manages poll staff. Published questions, choices, and voting rules are locked. Individual voter identities are never returned by the API.

## Deployment

Use Node 24 and the repository's Wrangler installation. The configured Worker is `feh-community-polls`; its D1 binding and public settings are in `wrangler.jsonc`.

For a new database, install `schema.sql`. For databases created before browser nonce binding was added, apply `migrations/002-login-browser-binding.sql` once instead. Do not apply that migration after the current fresh schema.

Set `GITHUB_CLIENT_SECRET` as an encrypted Worker secret. Never put it in source control. The GitHub OAuth application must allow the Worker's `/auth/callback` URL. Keep any existing website callback configured.

Run `node --test polls-service/worker.test.mjs` before deploying with `wrangler deploy --config polls-service/wrangler.jsonc`. GitHub Pages deploys the frontend separately. Its service URL is in `pages-app/poll-config.json`.

OAuth uses one-time browser-bound state and PKCE. Poll sessions last one day and only their hashes are stored. A scheduled cleanup removes expired authentication and rate-limit records. Votes are unique per poll and GitHub account; deadlines and access checks are enforced by the service.
