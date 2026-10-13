# Backend security review — 13 October 2026

Supabase project: aknsqeqykjgdyhdroqcx. Cloudflare Worker: feh-community-polls.

## Applied

- Removed six unnecessary client TRUNCATE grants on revival schedules, profiles, and personal tracking. Ordinary row operations and existing RLS policies remain.
- Removed anonymous execution grants on the two staff-management RPCs. Signed-in execution and internal Head Admin checks remain.
- Disabled both retired OAuth endpoints when website authentication is configured.
- Bound actual streamed request bytes for poll/forum JSON and image uploads, including missing or false Content-Length headers.
- Blocked reply-thread reads beneath hidden parent comments before cache lookup or GitHub requests.
- Added exclusions for local secret/database files and a CI credential check for recognizable Supabase secret/service-role tokens, GitHub access tokens, and private keys. Only filenames/categories are reported.
- Preserved media HEAD/range requests and uploader-only portrait cleanup through the Worker.

SQL: supabase/security-hardening.sql. Worker deployment: 943079e0-223e-4801-bb6c-05eed459af3c.

## Verified

All 19 application tables have RLS enabled; no public application views were found. Anonymous REST reads of private profiles, tracking, watchlists, moderation, and history return 401. Staff-management RPCs also return 401. An unrelated authenticated identity sees no private records or staff role in a rolled-back audit transaction.

Live Cloudflare staff/moderation/history/upload routes reject anonymous requests, foreign Origins return 403, and both retired OAuth routes return 400. Public hero reads, polls, and forum rules remain available. All 31 backend tests pass, including ownership, cross-discussion restrictions, moderator revocation, private results, encryption, hidden comments, and streamed byte limits.

D1 connection tokens have the expected encrypted format; token values were not read or printed. AES-GCM uses random per-token nonces and GitHub ID as associated data. The encryption secret is a Cloudflare Worker secret. The tracked-file pattern scan found no recognized private credentials; this does not cover all historical commits or every secret format.

## Deliberate public data

Schedules, skills, public profile fields, manager credits, and uploaded public images/videos are readable by design. Publishable Supabase keys identify clients; grants, RLS, and server authorization protect data. Public media must not contain confidential information.

Advisor notices for public profile/role SECURITY DEFINER functions remain because they intentionally expose restricted public fields or the caller's role. Staff functions retain internal role checks. The manager table intentionally has no client RLS policies and no client read grant.

## Remaining limits

- Supabase reports compromised-password protection disabled. Legacy email sign-in still exists; enable protection in Authentication if supported by the project's plan. Connected tools cannot change this Auth setting. See [password security](https://supabase.com/docs/guides/auth/password-security).
- Account MFA, organization membership, and recovery settings for GitHub, Supabase, and Cloudflare require owner verification and were not changed.
- Automatic approval review rejected a schema-wide privilege/default-grant reset because it could break legitimate access. It was not applied; the targeted fixes above were approved and applied. Existing default grants remain, so each new table/function still needs an explicit security review.
- Encryption derives from the GitHub client secret. Rotating it requires reconnecting forum integrations or controlled token re-encryption; do not rotate blindly.
- These checks do not guarantee zero future leaks or assess previously published information.

## Repeat checks

Run the three polls-service test files with Node's test runner, scripts/check-public-secrets.mjs, and scripts/security-live-check.mjs. The live check prints statuses only and performs no successful data mutations.

Reference guidance: [Supabase API security](https://supabase.com/docs/guides/api/securing-your-api) and [Cloudflare Worker secrets](https://developers.cloudflare.com/workers/configuration/secrets/).
