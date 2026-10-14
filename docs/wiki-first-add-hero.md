# Wiki-first Add Hero

The main site's Add Hero action opens Add Hero from FEH Wiki. It reads Fire Emblem Heroes Wiki pages on feheroes.fandom.com; old feheroes.gamepedia.com hero URLs are converted to canonical Fandom URLs.

1. Paste the hero page URL. Preview loads automatically.
2. Review identity, face icon, move type, weapon/color, hero type, release date and version.
3. Continue to choose a pool, schedule, and optional next rerun month. Use None or Skip next rerun month when no date is known.
4. Save hero publishes through the existing staff-authorized save path.

Only an exact variant-matched Face FC asset is used, including a check of the actual image filename. Full artwork is excluded. Portrait processing stays in the draft until Save hero. No hero or image upload is published during preview.
The new flow automatically stages highest-tier skills and detected weapon refinements, including their icons. Passive and refinement image downloads must succeed before continuing. Browser CDN downloads fall back to the staff import service and the matched thumbnail. Nothing is uploaded until Save hero.

Existing name/title matches offer Edit existing hero rather than creating a duplicate. Missing portrait/combat details or unsupported hero types direct staff to Legacy Add/Edit Hero.
The previous tabbed editor is named Legacy Add/Edit Hero and remains available from the new popup and the final-step review button. Existing edits continue to open it.

The new flow preserves banner/revival creation context. Schedule changes do not overwrite imported hero type. Backend permissions, image validation, and storage rules are unchanged.

Checks: scripts/wiki-first-add-hero-ui-check.mjs, scripts/wiki-editor-ui-check.mjs, scripts/wiki-import-ui-check.mjs, scripts/wiki-ally-weapons-check.mjs.

Multiple imports: paste up to 20 page URLs, one per line. Canonical Fandom/Gamepedia duplicates and repeated hero variants are collapsed. Preview each queued hero; failed rows and already-recorded heroes are identified separately. Each save opens the remaining queue. Cancelling stops the queue and leaves already saved heroes intact. Pool and schedule are chosen per hero.

Batch saving: Save multiple heroes appears for a multi-page preview. Choose each hero’s pool, schedule, and required rerun month, select the imports, and click Save selected heroes. Existing heroes and incomplete previews are excluded. Saves run sequentially with per-hero progress. Completed imports are marked Saved. If skills fail after the hero saves, retry resumes those skills with the same IDs and already uploaded icons; previously completed heroes are skipped. The batch is not an atomic database transaction.

Infobox classification: Special tags are recognized in Hero Type and Rarities, including image/link labels. Specialized hero types remain intact. Demote detection reads actual 3–4 or 4–5 rarity combinations and excludes Special Rate and reward-only heroes. Grand Hero Battle acquisition marks Heroic Grails. Original 4–5-star non-focus TT rewards also mark Heroic Grails; seasonal focus/SR heroes reused as later TT rewards keep their summonable classification. Detection is based on original acquisition evidence rather than a blanket December 2025 cutoff, which could exclude genuine original reward heroes around the transition. Single and batch imports persist demote/Grail flags; Grail Pool is preselected for original reward heroes.

Starter exception: Alfonse: Prince of Askr, Anna: Commander and Sharena: Princess of Askr (General) are identified by exact name/title/type. They have no summoning pool, are not demotes/Grail heroes, and save with a null pool. Their variants are unaffected.
