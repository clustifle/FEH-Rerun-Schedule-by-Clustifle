# Import hero info from FEH Wiki

For Head Admin and Schedule Manager:

- On the main website, open a hero profile and choose **Import from FEH Wiki**.
- In Administrative Manager, use **Records to check → Import wiki** beside a hero.

The dialog suggests a wiki URL. Change it if needed, then choose **Preview wiki info**. The hero name and variant title must match.

Review the current and wiki release fields. Blank fields are selected automatically; existing values are not selected for replacement. A debut version must already exist in Manage FEH Versions.

The skills preview offers the best available tiers, the final weapon/assist/special, and wiki passive icons. Existing skill records are retained and identical names in the same slot are skipped. X skills apply only to Attuned heroes. Refines and Exclusive (PRF) settings remain manual.

Choose **Merge selected info** to save. Previewing makes no record changes. Wiki icons download directly without a site referrer, with the image proxy as a fallback. An unavailable icon no longer blocks release details or other skills: the dialog names the failed skills and keeps them selected for retry. Existing skills are not duplicated.

Data source: [Fire Emblem Heroes Wiki](https://feheroes.fandom.com/). The integration uses its public MediaWiki parse API. Wiki page availability and layout can change; failed or mismatched pages are shown as errors.

Verification uses a compact fixture from [Alm: Saint-King](https://feheroes.fandom.com/wiki/Alm:_Saint-King), with isolated database and image-upload responses. It covers variant matching, release fields, highest tiers, icon imports, duplicate skipping, stale previews, selected merges, mobile layout and both website entry points. No live records are filled by the test.
