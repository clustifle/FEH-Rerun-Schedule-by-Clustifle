# Contributing

Thank you for helping improve Fire Emblem Heroes Rerun Schedule. Please follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Bugs, ideas, and schedule corrections

Open a GitHub issue with a clear description. For bugs, include the affected page, theme, device or browser, reproduction steps, expected behavior, and screenshots when useful. Remove personal information from screenshots.

For schedule corrections, include the hero or banner name, dates, timezone, and a source such as an in-game announcement or official notice. Clearly distinguish confirmed information from predictions.

Discuss substantial redesigns or new features in an issue before starting a large pull request.

## Local development

Use Node.js 24 and pnpm 11, matching the deployment workflow.

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm dev:pages
```

The GitHub Pages application is in `pages-app/`; shared styling is in `app/`. Public images and theme assets are in `public/`. Database SQL files are in `supabase/`.

## Pull requests

1. Create a branch with a focused change.
2. Explain the problem, resulting behavior, and how you checked it.
3. Include desktop and mobile screenshots for visible changes.
4. Check all affected realm themes, keyboard navigation, and reduced-motion behavior.
5. Run the relevant checks before submitting:

```sh
pnpm exec tsc -p tsconfig.pages.json
node --test scripts/banner-time.test.mjs
pnpm build:pages
```

For portrait-delivery changes, install Pillow and also run:

```sh
python scripts/test-portrait-sync.py
```

Avoid unrelated formatting or dependency changes. Keep secrets, service-role keys, personal data, and local environment files out of commits.

## Schedule data and access

Only the Head Administrator and authorized Schedule Managers manually add or edit live schedule data and waitlist entries. A contribution does not grant editing access. Do not modify the production database while testing; use a separate development environment and preserve existing access controls.

Heroes marked as unscheduled use notes without a schedule month. Do not add a public None Schedule page or automatically populate waitlists from a hero's category.

## Assets and attribution

Preserve existing copyright notices and asset source records. Include the source and permission or license for any new third-party asset. Nintendo artwork, game sprites, backgrounds, supplied fonts, and other third-party materials are not covered by the project's code license.

Submit only work you have the right to contribute. By submitting original work, you grant Clustifle permission to incorporate, modify, and distribute it as part of this project under the repository's all-rights-reserved terms. You retain ownership of your contribution unless separately agreed. Third-party material keeps its own terms.

The repository is publicly available but is not open source. Reuse outside contributions to this project requires the applicable copyright holder's written permission; see [LICENSE](LICENSE).
