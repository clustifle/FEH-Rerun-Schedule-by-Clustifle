# FEH Rerun Schedule v2.0 Beta

Branch: `beta`. Private site: https://feh-rerun-beta.shyguyvn.workers.dev/

Administrative Manager is a separate application at `/FEHRS_AdmManager/`, with a Server Manager inspired dashboard, left navigation, and Segoe UI. Its standalone bundle is built using `vite.administrative.config.ts`; all routes and assets remain protected by the beta Worker. Mods Edit combines bulk hero editing and FEH version management. The beta website links to this application instead of embedding the tools. The intended production address is `https://clustifle.github.io/FEHRS_AdmManager/`; publication there requires a separate production build and existing staff-authorized data services. Private beta deployment does not publish that GitHub Pages site.

The public GitHub Pages site remains on `main` and version 1.0. Never deploy this branch through the Pages workflow. A separate Cloudflare Worker runs before **every** asset request and verifies the existing Supabase user and trusted `tracker_role()` result. Only `Owner` can access the application and its beta API. Visitors and Schedule Managers receive the beta sign-in screen or HTTP 403. Login code, the Beta logo, and its font are the only public assets. Search indexing and service workers are disabled.

Authentication remains with the existing Supabase project and GitHub provider. Its allowed return URLs include `https://feh-rerun-beta.shyguyvn.workers.dev/?auth=github`. The live Site URL is unchanged. The beta session cookie is HttpOnly, Secure, SameSite=Lax, and renewed by the existing access token. Previously verified GET requests can reuse verification for at most 60 seconds and never beyond token expiry; writes and session creation reverify access.

## Available in beta.1

- Supplied Beta logo in the site header, sign-in screen, and About.
- Isolated D1 hero records, copied once from public schedule data.
- Debut FEH version, release date, and original summon event fields.
- Version management, major/specific-version filtering, and an unassigned filter.
- Weapon color, weapon type, and movement dropdowns.
- Explicit-field bulk editing, mixed-value indicators, review before save, transactional updates, and stale-preview protection.
- Account-scoped personal watchlists and hero follow buttons.
- Hero debut details, recorded banner appearances, and related variants.
- Multi-select Choose a Hero for all waitlists and Schedule Under Consideration, with selection preserved across filters.
- Multi-select version management: reviewed date/order changes and deletion with hero reassignment.
- Beta change history.

No historical release version is inferred. Seeded versions 1.0–10.0 have no guessed release dates; add individual updates through **Versions** and assign heroes manually.

## Isolation and limitations

Hero edits, version changes, personal watchlists, and rerun waitlist/consideration memberships write only to `feh-rerun-beta` D1. Production Supabase data is read-only in this build. Other editing tools, staff/account/profile changes, live poll votes/management, and portrait uploads are blocked in the beta client. The original live authentication remains operational. Do not remove this protection until the corresponding beta data services exist.

Banner and revival lineups still read live published records. Waitlist and consideration memberships are isolated beta copies, seeded once from public memberships. Existing deployments can create their table using `beta-service/waitlist-schema.sql`; avoid reseeding after beta membership edits. Assigning a hero a waitlist category does not add a lineup entry. Existing portraits are preserved. Historical banner coverage includes only records already stored on the website.

GitHub Discussions, contribution review, expanded polls, calendar export, archive backfill, and broader schedule tools remain subsequent beta work. The community page is a staged entry point; the public repository's Discussions are not enabled automatically during private testing.

## Validate and deploy

```sh
pnpm exec tsc -p tsconfig.pages.json
node --test beta-service/worker.test.mjs
node scripts/build-beta.mjs
pnpm exec wrangler deploy --config beta-service/wrangler.jsonc
```

The beta workflow checks builds on branch pushes without publishing to the live site. Deployment uses the existing authorized local Wrangler login; no permanent Cloudflare deployment token is committed or created.

For initial database setup only:

```sh
pnpm exec wrangler d1 execute feh-rerun-beta --config beta-service/wrangler.jsonc --remote --file beta-service/schema.sql
python scripts/prepare-beta-seed.py
pnpm exec wrangler d1 execute feh-rerun-beta --config beta-service/wrangler.jsonc --remote --file beta-service/seed.sql
```

The seed file is ignored. `INSERT OR IGNORE` preserves existing test edits. Never seed user emails, profiles, credentials, or authentication tables.

The standalone UI test fixture is `beta-service/ui-test.html`; it is a developer fixture and is not a build entry point or deployed asset.
