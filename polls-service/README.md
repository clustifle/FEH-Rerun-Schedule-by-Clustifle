# Community polls service

Cloudflare Workers and D1 store polls and votes. Authentication uses the registered website account: the Worker verifies its access token through Supabase Auth and checks the existing `tracker_role` RPC. Head Admin and Schedule Managers can manage polls without a separate GitHub login. Staff roles are managed through the existing website Mods Tool.

Managers can create and review drafts, publish polls, close voting, archive polls, feature open polls on Home, and export aggregate results. Voting requires a registered, nonanonymous website account with a verified GitHub identity. Votes remain unique per GitHub account across linked website accounts. Published questions, choices, and voting rules are locked. Individual voter identities are never returned by the API.

## Deployment

Use Node 24 and the repository's Wrangler installation. The configured Worker is `feh-community-polls`; its D1 binding and public settings are in `wrangler.jsonc`.

For a new database, install `schema.sql`. For databases created before browser nonce binding was added, apply `migrations/002-login-browser-binding.sql` once instead. Do not apply that migration after the current fresh schema.

Set `GITHUB_CLIENT_SECRET` as an encrypted Worker secret. Never put it in source control. The GitHub OAuth application must allow the Worker's `/auth/callback` URL. Keep any existing website callback configured.

Run `node --test polls-service/worker.test.mjs` before deploying with `wrangler deploy --config polls-service/wrangler.jsonc`. GitHub Pages deploys the frontend separately. Its service URL is in `pages-app/poll-config.json`.

The original independent OAuth endpoints and session tables are retained for compatibility, but separate poll login is disabled when website authentication is configured. Website access tokens are verified per request and never stored in D1. Only the public Supabase key is configured; no service-role key is used. A scheduled cleanup removes expired legacy authentication and rate-limit records. Deadlines and access checks are enforced by the service.
