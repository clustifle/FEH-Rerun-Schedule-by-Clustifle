# v3.5 release validation

The review uses the built public and Administrative Manager applications, with simulated accounts and records for browser actions. No real posts, role changes, hero edits, or saved-data resets are used for testing.

## Coverage

| Area | Checks |
| --- | --- |
| Public pages | 27 routes at 320, 768, and 1280 pixels; page overflow, open dialogs, and render failures |
| Staff workspace | Every section for Head Admin and Schedule Manager; Forum-only navigation for Moderator; 390 and 1280 pixels |
| Keyboard | Skip to content, visible focus, native modal focus containment and Escape return, arrow/Home/End tab activation, and roving tab stops |
| Themes and About | All 11 realm controls; exact six-line About copy, `Version 3.5_main`, and no feature list or links in About |
| Portrait delivery | Forced optimized-image failure retries the original; original failure uses the local placeholder; recovery stops without a request loop |
| Catalog | All 2,005 test heroes loaded in three stable pages, bounded rendering, final-page access, and search beyond 2,000 |
| Staff workflows | Records review, pool-range changes, moderator management, wiki preview/draft/save, batch import retry, weekly revivals, and revival movement |
| Personal data | Collection preservation, sort/view persistence, previous rerun handling, saved schedules and earlier follows, and write prevention after read failure |
| Exports | Standalone waitlist image output and existing portrait presentation |
| Forum | Automatic and manual connection recovery; private draft, role, moderation, upload, and publication service tests |

TypeScript and both production builds pass. The service, directory-data, and draft-sync test group contains 56 passing tests. Browser workflow coverage is collected by `scripts/final-workflow-suite.cjs`.

## Issues resolved in the review

- Missing generated entry pages for Personalization, Refine Predictions, and Skills. Page generation now includes the registered public route list.
- Overlapping arrow-key handling in tab groups that already implemented shortcuts. Shared handling respects an event already handled by the component.
- Unrecoverable optimized portrait failures; delivery now falls back to the original and a local placeholder.
- Outdated version/help text and eagerly imported secondary page and wiki-editor code.
- Inconsistent focus, touch, dialog sizing, loading, and error presentation.

## Performance observation

The public entry script decreased from 939,612 to approximately 859,099 uncompressed bytes (about 8.6%). Secondary page and wiki-editor code loads on demand. This is a build-size observation, not a promise of a particular network or device timing. Some existing shared chunks remain large.

## Running the browser checks

Build with `node scripts/build-pages.mjs`, start `node scripts/serve-final-preview.mjs`, then run `node scripts/final-workflow-suite.cjs`. The preview binds to localhost port 5205. Browser checks require Playwright and Chromium; `PLAYWRIGHT_MODULE` and `CHROME_PATH` can select an existing test runtime and browser. The runner blocks service workers in test contexts so mocked requests cannot be bypassed by cached assets. Normal production service-worker behavior is retained.

## Limits

This is not a formal accessibility certification or a substitute for testing every browser and assistive technology. Browser write tests use mocks; external-provider availability, personal GitHub consent, and manually maintained schedule accuracy are not established by these checks. No database schema or permission policy changes are included. Prior account records and preference keys remain in place.

No known release-blocking issue remains in the reviewed scope. Further fixes follow the [maintenance policy](../MAINTENANCE.md).
