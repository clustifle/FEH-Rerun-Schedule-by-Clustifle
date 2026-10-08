# Mods Tool

Open **Mods Tool** from navigation while signed in as a Schedule Manager or Head Admin. The page is available at `/mods-tool` beneath the website base path.

| Section | Schedule Manager | Head Admin |
| --- | --- | --- |
| Overview | Hero counts and incomplete records | Same |
| Heroes | Add/edit heroes and portraits; assign existing types and pools | Also create, edit, and archive types and pools |
| Schedules | Existing schedule, revival, banner-slot, and banner-order editors | Same |
| Waitlists | Manually add/remove heroes and reorganize L/M/E, DSH, and NHR lists | Same |
| Site Content | No access | FAQ, announcements, and website release notes |
| Staff & Users | No access | Assign/remove Schedule Managers; hide/restore public profiles |
| History | Hero and schedule changes | All administrative changes |

## Definitions and content

New hero types and pools are database records. They appear in hero forms, filters, hover tags, profiles, and portrait badges when an icon is supplied. Type and pool names are immutable to preserve assignments and links. Archive a definition to stop new assignments; existing heroes keep it.

Content supports paragraphs, bold text, and ordered/unordered lists without rendering arbitrary HTML. Use Preview before saving. Unpublish an entry to remove it from public display without deleting it. Existing FAQ sources are preserved when an answer is edited.

Announcements appear on Home. Website release notes appear in Settings → Updates; they do not modify GitHub Releases. Content updates compare the previously loaded revision to prevent overwriting another editor's change.

Profile moderation hides a profile from public search and lookup. The user can still sign in and edit their own profile. This is not an authentication-account suspension. Staff actions require an explicit confirmation in the interface, and Head Admin access cannot be transferred or removed.

## Backend

`mods-tool.sql` is the initial installation script. It seeds the existing 13 hero types, pools, and 32 FAQ entries; creates protected content, moderation, and audit tables; replaces fixed hero-type/pool checks with validated definitions; and preserves the existing verified-account role system. Do not rerun it over an installed database.

RLS restricts definitions/content to Head Admin writes. Staff RPCs recheck Head Admin status inside the database, exclude anonymous execution, and protect the Head Admin account. Trigger functions live in a private schema with a fixed search path. Audit history cannot be written through the browser, and managers can read only hero/schedule events. History starts at installation; it does not reconstruct earlier edits.

No service-role key or SQL console is included in the website. Supabase and GitHub still handle infrastructure, authentication-provider configuration, backups, and deployment.
