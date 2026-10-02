# Clustifle's FEH Rerun Tracker

Public FEH rerun tracker for General, Remix, and Monthly Revival schedules. Visitors can browse without an account; only the confirmed owner account can add or edit heroes.

## Hosting

Frontend: GitHub Pages at https://clustifle.github.io/FEH-Rerun-Schedule-by-Clustifle/ . Pushes to main deploy automatically with GitHub Actions. Repository Settings → Pages must use GitHub Actions.

Backend: Supabase project aknsqeqykjgdyhdroqcx, with public read access and database/storage policies restricting changes to the confirmed owner email. The publishable key is public by design; never commit service-role keys, passwords, or access tokens.

## Local development

Use Node 24 and pnpm 11. Run `pnpm install --frozen-lockfile`, then `pnpm dev:pages`. Build with `pnpm build:pages`; type-check with `pnpm exec tsc -p tsconfig.pages.json`.

## Backend setup

1. Execute supabase/setup.sql in Supabase SQL Editor, then supabase/import-heroes.sql to restore the original export. Imports do not overwrite existing hero IDs.
2. Create the owner user shyguyvn@gmail.com in Authentication → Users, with a fresh password entered privately. Auto-confirm the user. Disable public sign-ups in Sign In / Providers.
3. Set Authentication Site URL and allowed redirect URL to the GitHub Pages URL above, including the trailing slash. Forgot password sends a recovery email and opens the password form on the website.
4. Deploy supabase/functions/portrait-import as the Edge Function portrait-import. Disable gateway JWT verification for this function: it verifies the user JWT and owner authorization itself. This preserves FEH Wiki/Fandom image-link imports without browser CORS restrictions.

New portraits use Supabase Storage. The initial 16 portraits remain under public/data/portraits, and the initial data export is in migration-data. Editing data does not require rebuilding the frontend.

## Source layout

pages-app/ contains the portable React frontend and Supabase adapter. app/, lib/, drizzle/, and the original build scripts retain the previous Sites application source for reference. The original deployment remains https://feh-rerun-ledger.clustifle.chatgpt.site/ . Changes made there after this export are not synchronized automatically.

Artwork belongs to Nintendo / INTELLIGENT SYSTEMS. This is an unofficial fan tracker.
