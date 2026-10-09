# Public v2.0 release checks

- Production build includes both the website and standalone Administrative Manager.
- TypeScript checks and 32 backend tests passed.
- Public website layout checks passed on 48 route/viewport combinations (320, 360, 390, and 768 px).
- Sprite transparency and hover checks passed across all 11 themes at 320 and 1280 px.
- Compiled public UI checks with mocked staff sessions passed for Head Admin and Schedule Manager: version management, hero saving, bulk editing, private watchlists, mobile manager navigation, and Community Posts coming soon. No beta API requests were made.
- Production SQL operations were tested in rolled-back transactions, including version creation, renaming, deletion, hero editing, and stale-preview rejection.
- New table permissions and private watchlist policies were checked explicitly. Anonymous users cannot invoke bulk editing or access the private watchlist table.
- Migration preserved 248 production heroes, 15 profiles, and 8 original personal-tracking records; 17 followed heroes were copied into My Watchlist.
- Beta test records are not imported into production. Closing the beta preserves its separate D1 database.

Community Posts and GitHub Discussions integration remain coming soon. Authenticated UI checks use mocked sessions; they do not exercise a new live GitHub authorization consent flow.
