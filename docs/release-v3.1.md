# v3.1 — Schedule navigation and date clarity

- Shared Schedule view selector across rerun schedules, revivals, refine predictions and waiting lists.
- Copy page link shares the current URL, including recorded month and view parameters.
- Contextual guidance distinguishes month windows, exact dates, predictions and undated waiting lists.
- Expandable date guide explains confirmation without assigning new statuses to existing records.
- Schedule and refine image export actions use a visible Export image label.
- Schedule images that include waitlists or entries under consideration retain a dates-not-confirmed note even when the optional website footer is hidden.

No schedule records, prediction statuses, account data or staff write permissions are changed. Existing revival editors, countdowns and refine editing remain in place.

Validation: TypeScript, production build, and `scripts/schedule-v31-check.mjs` for route switching, link sharing, export disclosure and mobile layouts.
