# v3.4 — Final design and quality pass

- Added shared focus indicators, control spacing rules, touch targets, dialog viewport limits, and loading/error presentation while retaining realm themes and game-style buttons.
- Added Skip to content on the public site and staff workspace. Tab groups support arrow keys and Home/End; header dropdowns close when keyboard focus leaves navigation.
- Deferred wiki import tools, profile editing, and hero profile code until requested, reducing the public entry bundle.
- Optimized portrait failures retry their original delivery source, then use a local placeholder when the original is unavailable. The placeholder preserves portrait geometry and existing accessible text.
- Updated help for combined navigation, all four waitlists, game origins, directory views, watchlists, exports, and Forum access.
- Simplified About to the requested classic text panel with `Version 3.5_main`. Help and repository documentation carry release notes, credits, and maintenance links.
- Generated entry pages from the public route list, including Personalization, Refine Predictions, and Skills.

These changes do not alter portrait badge placement, the clean Hero Profile portrait, All Heroes' full-size header, or existing saved account data.
