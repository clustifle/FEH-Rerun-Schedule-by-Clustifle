# Maintenance policy

Version 3.5 is the final planned feature release. The major feature roadmap is closed.

## What continues

- Manually maintained hero, banner, schedule, revival, and waitlist records.
- Bug fixes, data-preservation fixes, security updates, and dependency maintenance.
- Browser compatibility, accessibility, performance, and documentation corrections.
- Recovery work for unavailable services and changes to external providers.

New major features require a separately agreed roadmap. A suggestion or issue does not promise implementation or a delivery date. Maintenance is performed as availability allows; there is no guaranteed response time or service-level agreement.

## Reporting problems

Use [GitHub issues](https://github.com/clustifle/FEH-Rerun-Schedule-by-Clustifle/issues) for reproducible bugs and corrections. Include the affected page, browser, steps, and expected result. For schedule corrections, include a source and distinguish announced information from predictions. Never include passwords, provider tokens, private drafts, or personal account records in a public issue.

Report suspected security vulnerabilities privately using the repository's private vulnerability reporting feature when available. Otherwise contact the maintainer through a private channel; do not publish exploit details or credentials in an issue.

## Releasing maintenance fixes

Use patch releases after 3.5, record changes in release notes, and deploy only after relevant checks pass. Preserve account IDs, watchlist collections, earlier follows, saved schedules, and existing browser preference keys. Database changes must be additive or explicitly reviewed with a recovery plan. No data reset is part of the final release.

Public code and documentation are MIT-licensed. Game artwork and other third-party assets retain their existing rights; see [third-party notices](THIRD_PARTY_NOTICES.md).
