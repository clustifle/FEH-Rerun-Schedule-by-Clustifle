# Import hero info from FEH Wiki

For Head Admin and Schedule Manager:

- In the main Add/Edit Hero form, choose **Import from FEH Wiki**, preview the page, then **Apply to hero draft**. Imported fields and skills are saved only with **Save hero**; Cancel discards them. Blank new-hero names and titles can be filled from the wiki.
- On a main-site hero profile, choose **Import from FEH Wiki** to merge selected info directly into the saved record.
- In Administrative Manager, use **Records to check → Import wiki** beside a hero.

The dialog suggests a wiki URL. The preview loads automatically when the importer opens and when you change the URL. **Refresh preview** is available if you want to retry. The hero name and variant title must match.

Review the current and wiki release fields. Blank fields are selected automatically; existing values are not selected for replacement. A debut version must already exist in Manage FEH Versions.

The skills preview offers the best available tiers, the final weapon/assist/special, and wiki passive icons. Existing skill records are retained and identical names in the same slot are skipped. X skills apply only to Attuned heroes. Use the Exclusive (PRF) checkbox on eligible new skills; X skills do not have this checkbox. Existing skills retain their saved PRF settings. For weapons, enable **Refine** to import a custom refinement icon. If the hero page includes its refinement artwork, the URL is filled automatically; otherwise paste the direct icon URL. A refinement cannot be imported without an icon. Refined and unrefined weapon records remain separate.

Choose **Merge selected info** to save. Previewing makes no record changes. Wiki icons download directly without a site referrer, with the image proxy as a fallback. An unavailable icon no longer blocks release details or other skills: the dialog names the failed skills and keeps them selected for retry. Existing skills are not duplicated.

Data source: [Fire Emblem Heroes Wiki](https://feheroes.fandom.com/). The integration uses its public MediaWiki parse API. Wiki page availability and layout can change; failed or mismatched pages are shown as errors.

Verification uses a compact fixture from [Alm: Saint-King](https://feheroes.fandom.com/wiki/Alm:_Saint-King), with isolated database and image-upload responses. It covers variant matching, release fields, highest tiers, icon imports, duplicate skipping, stale previews, selected merges, mobile layout and both website entry points. No live records are filled by the test.

Skills List groups copies of a skill by normalized name and slot, preserving hero associations and distinguishing custom weapon refinements. Duplicate manual entries and repeated imports into one hero are skipped or rejected without deleting existing records.
