# v3.1 — Schedule navigation and date clarity

- Single Schedule & Waitlist header dropdown, with grouped destinations.
- Compact Schedules / Waitlists tabs with short destination labels and an active-view highlight. Destination rows scroll horizontally on small screens.
- All schedule pages share the same centered frame and title-before-switcher order, including New Heroes Revival, Hall of Forms and Refines. Nested content uses the frame's padding instead of adding a second inset.
- Copy page link shares the current URL, including recorded month and view parameters.
- Schedule and refine image export actions use a visible Export image label.
- Schedule images that include waitlists or entries under consideration retain a dates-not-confirmed note even when the optional website footer is hidden.

No schedule records, prediction statuses, account data or staff write permissions are changed. Existing revival editors, countdowns and refine editing remain in place.

Validation: TypeScript, production build, and `scripts/schedule-v31-check.mjs` for route switching, link sharing, export disclosure and mobile layouts.
