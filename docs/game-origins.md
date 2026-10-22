# Game origins and Catalog order

Verified 2026-10-22 against the FEH Wiki [Catalog of Heroes](https://feheroes.fandom.com/wiki/Catalog_of_Heroes) and [List of Heroes](https://feheroes.fandom.com/wiki/List_of_Heroes).

The bundled catalog contains 1,427 unique entries, their exact catalog positions, and one or more entry-filter origin groups. The list's game icons supply origin groups; catalog position is independent of which icon appears first. Cross-game entries match every recorded origin, and shared origins render once. Unknown future heroes have no guessed origin and sort after mapped entries.

All 1,427 current website records match by normalized name and epithet. Parenthetical gender/age labels and accents are normalized; epithet remains part of the identity. The website contains two records for Seiðr: Hope Reborn (including “Seiðr (2.0)”) and no record for Excellus: Conqueror’s Wile. No existing hero records were changed or deleted. Audit: `scripts/origin-match-audit.json`.

Release · newest remains the default. Game order · Catalog is optional. Game origin in Filters matches either origin of a cross-game entry. Origin names are searchable and appear in Details view; icons appear in all directory views with accessible labels and tooltips.

The data is bundled with the app, so viewing and sorting do not depend on a live wiki request. For updates, refresh the two source snapshots (`scripts/catalog-order.json` and `scripts/catalog-origins.json`), run `scripts/build-origin-catalog.mjs`, then `scripts/audit-origin-matches.mjs`. Review unmatched identities before publication.

Icon sources and filenames are recorded in `public/images/game-origins/manifest.json`. Game artwork belongs to Nintendo / Intelligent Systems.

Validation: public and admin production builds, TypeScript, full directory mapping audit, and `scripts/origin-ui-check.mjs` covering catalog order, default sort, cross-game filters, icon deduplication, and mobile width.
