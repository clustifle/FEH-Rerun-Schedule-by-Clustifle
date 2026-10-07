# Contributing

Everyone is welcome to help improve **Fire Emblem Heroes Rerun Schedule**. You do not need coding experience: rerun information, corrections, ideas, testing, documentation, and design feedback are all useful contributions.

Please follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Ways to help

- Submit confirmed rerun dates, banner lineups, or revival information.
- Correct hero details, notes, missing information, or outdated entries.
- Suggest features, filters, accessibility improvements, or theme refinements.
- Report bugs and test the website on different browsers and devices.
- Improve documentation, design, or code through a pull request.

## Schedule and hero contributions

[Open an issue](https://github.com/clustifle/FEH-Rerun-Schedule-by-Clustifle/issues) with the hero or banner name, schedule category, proposed correction, dates and timezone where relevant, and a source such as an in-game announcement or official notice. Screenshots are welcome; remove personal information.

Clearly distinguish confirmed information from predictions. For waitlist suggestions, identify L/M/E, Double Special Heroes, or New Heroes Return.

Anyone can suggest changes. The Head Administrator and authorized Schedule Managers review and apply changes to the live website. Open-source contributions do not require manager access, and manager permissions are not automatically granted to contributors.

## Bugs and ideas

Include the affected page, theme, device or browser, steps to reproduce, and expected behavior. For ideas, explain what would improve and who it would help. Discuss substantial redesigns before starting a large pull request.

## Code contributions

Fork the repository, create a branch, make a focused change, and open a pull request. Describe the problem, resulting behavior, and your checks. Include desktop and mobile screenshots for visible changes.

Use Node.js 24 and pnpm 11, matching the deployment workflow:

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm dev:pages
```

The GitHub Pages application is in `pages-app/`; shared styling is in `app/`. Public images and theme assets are in `public/`. Database SQL files are in `supabase/`.

Check affected realm themes, keyboard navigation, and reduced-motion behavior. Run the relevant checks:

```sh
pnpm exec tsc -p tsconfig.pages.json
node --test scripts/banner-time.test.mjs
pnpm build:pages
```

For portrait-delivery changes, install Pillow and run `python scripts/test-portrait-sync.py`.

Keep changes focused. Do not commit credentials, service-role keys, personal data, or local environment files. Test database changes in a separate development environment rather than the production database, and preserve existing access controls.

Heroes marked as unscheduled use notes without a schedule month. Do not create a None Schedule page or automatically populate waitlists from a hero's category.

## Review and licensing

Maintainers review contributions for accuracy, usability, and compatibility with the website. They may request revisions before merging or updating live data.

Original project code and documentation are open source under the [MIT License](LICENSE). By submitting original code or documentation, you agree to contribute it under MIT. You retain copyright in your contribution; no copyright assignment is required.

Submit only material you have the right to contribute. Include the source and applicable rights or license for new third-party assets, and preserve existing notices. Nintendo artwork, game sprites, backgrounds, supplied fonts, and other third-party materials retain their own terms; see [Third-party notices](THIRD_PARTY_NOTICES.md).
