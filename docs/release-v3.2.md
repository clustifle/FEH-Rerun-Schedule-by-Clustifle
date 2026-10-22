# v3.2 — Directory, portraits, exports, and Forum recovery

- Added game origin browsing and Catalog of Heroes ordering, including both origins for heroes from multiple games.
- Unified portrait badges across the site, with compact stacked origins and consistent hero type sizing. Added Extra large directory portraits.
- Simplified Hero profiles: clean main portrait, release details in Overview, and a separate portrait-based Other variants card.
- Added image export for DSH, NHR, LME, and Remix waitlists, with concise notices and cleaner rows.
- Added a compact scrolling header outside All Heroes, plus smoother Feh expressions and happy-to-sleep transitions.
- Fixed Forum showing posting as enabled after GitHub authorization expires. A Reconnect GitHub action now starts authorization and returns to the same discussion. Public reading can continue through the public feed where available.

Expired or revoked GitHub authorization requires the account holder to reconnect once. Failed posts, replies, and votes are never automatically retried. Existing saved post drafts remain account-scoped.

## Personal tracking finalization

- Redesigned My Watchlist with direct hero selection, collection counts, search, five sorts, and grid/list/icon views. Sort and view persist per account on each browser; the earlier view preference is retained as a fallback.
- My Profile uses a compact desktop sidebar and side-by-side cards for favorites, watchlist totals, upcoming heroes, and saved schedules. Phone layouts stack.
- Restored saved schedules and earlier followed heroes without an automatic migration or deletion. Saved schedule updates preserve followed heroes and conditionally match the previously read schedules to detect concurrent edits. Failed reads cannot enable writes.
- Account settings explain public profile visibility, private account data, and browser display choices. Removed repetitive privacy captions from watchlist and profile cards.
- Hero profile watchlist state refreshes on account changes. Writes verify the expected account, and past rerun dates are labeled as previous records.
- Forum automatically restores its connection when a valid GitHub provider token is available. Concurrent requests share one restoration attempt. Revoked GitHub access still requires consent; write actions are never replayed.

Validation uses simulated saved records and accounts to check preservation, write failures, display persistence, compact desktop layout, phone overflow, and both automatic and manual Forum recovery. No account data or schema reset is part of this release.
