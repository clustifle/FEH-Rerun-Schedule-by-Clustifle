# Community Posts

The website Community page uses the repository's GitHub Discussions. Posts and replies created on either website appear in the same discussion. Posts publish under the connected GitHub user's identity.

- Categories, fourteen text-only post flairs with distinct colors and flair filters, search, newest/recent activity/popularity sorting, and pagination. Flairs are stored as a visible flair line and an identifying Markdown comment in the GitHub post, so author edits preserve the association. They do not require granting ordinary members GitHub label-management permissions.
- Visual rich text editor: headings, bold, italic, strikethrough, lists, quotes, code blocks, tables, links, images, emoji, and undo/redo. Post and reply content use Segoe UI. GitHub-compatible Markdown is generated internally.
- Picture uploads, pasted images, and drag/drop. Pictures are optimized to WebP, at most 1600 pixels and 512 KB, and served by Cloudflare. HTTPS picture URLs also work.
- Drafts and bookmarked posts saved on the current device. Drafts are scoped to the website account.
- Replies, paginated threaded replies, upvotes, author post/reply edits and deletion, and accepted answers for Q&A.
- Administrative Manager Community section for staff. Closing/reopening requires both a website staff role and GitHub's repository permission. GitHub remains the place for advanced moderation and category management.

## Authorization

GitHub website sign-in requests `user:email public_repo` and connects posting automatically after username setup. Existing accounts approve the additional access once. Connections persist across sign-ins without a posting toggle. `public_repo` is required by GitHub's Discussions API for public repositories. This scope also covers other public repository capabilities at GitHub; the service only exposes fixed Community operations for this repository. It never accepts arbitrary GraphQL requests or repository names.

The service verifies the website session, registered username, and matching GitHub identity before accepting a provider token. Connections are encrypted using AES-GCM with account-bound authenticated data and a key derived from the Worker's secret. Tokens never appear in public responses or committed files. The website does not expose a posting disconnect toggle; existing public posts and website sign-in remain independent of the connection. GitHub OAuth permissions can also be revoked in GitHub account settings.

Head Admin uses **Connect public feed** once to authorize the service's public read connection. Only public repository data is exposed; viewer permissions are stripped from anonymous reads, and hidden comments stay hidden. Public reads are cached for 60 seconds; publishing clears the cache. OAuth revocation requires reconnection. Previously public cached content can remain visible for its cache lifetime.

## Storage and deployment

Community runs within the existing polls Worker and D1 database. It adds `community_connections`, `community_cache`, and `community_images` without changing polls or votes. Pictures are public and immutable. Uploads require posting authorization, enforce type and byte limits, five uploads per minute, fifty per day, and a 200 MB service storage budget. Images attached to existing discussions remain after disconnecting. External HTTPS picture links remain available when upload capacity is reached.

Apply the additive schema through `wrangler d1 execute` with `--command` and the contents of `polls-service/community-schema.sql`; the current deployment token does not authorize the separate file import endpoint. Deploy using `polls-service/wrangler.jsonc`. GitHub Pages builds include the website and Administrative Manager Community route.

Validation: `node --test polls-service/worker.test.mjs polls-service/community.test.mjs`, TypeScript, production builds, and `scripts/community-ui-check.mjs`. Live posting should be tested by an authorized user with a real community post, rather than publishing automated test content.

Local validation passed: fourteen Community/polls security and lifecycle tests; actual GitHub query-schema validation without publishing; sanitized Markdown and image upload/publish/reply flows using simulated GitHub data; four responsive widths (320, 390, 768, 1280); Administrative Manager mobile layout; TypeScript; website/admin production builds; existing Head Admin/Schedule Manager hero/version/watchlist workflows. OAuth connection and real-user posting remain live setup checks.

## Forum moderation

The website labels Community as Forum while preserving existing community URLs. MOD Banner, Binding World, and Hall of Forms megathreads are selectable and writable only by Head Admin, Schedule Managers, or Forum Moderators. The server checks both new and existing flairs during creation and editing. Head Admin manages forum-only moderator membership in Administrative Manager > Forum. Membership is stored in Cloudflare D1 and does not grant schedule or poll permissions.

Browse by flair uses a compact selector and three megathread shortcuts. Post actions are borderless and left-aligned, with a visible upvote count.

## Forum rules and moderation
The Forum displays shared rules. Administrative Manager provides post and reply review, website-only hide/restore with a required reason, and moderation history. GitHub content remains on GitHub when hidden on the website. Closing or reopening discussions uses the staff member's GitHub repository permissions. Head Admin assigns Forum Moderators; their Administrative Manager access is limited to Forum tools.

Poll management uses readable dark text on the light administrative interface, including forms and status filters.

