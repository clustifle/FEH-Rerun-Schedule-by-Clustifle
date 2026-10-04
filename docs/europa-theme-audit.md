# Europa Nuova theme audit

This audit tracks Default-theme colors that appeared unintentionally while Europa Nuova was selected. Corrections are scoped to `html[data-theme=europa-nuova]` so the Default theme keeps its existing appearance.

## Corrected interface elements

| Area | Corrections |
| --- | --- |
| Home | Banner-count badge, empty-slot text, and action-button hover colors. |
| Settings | Checkbox accents, row dividers, inherited text, helper text, and mobile section labels. |
| Navigation and FAQ | Authentication-link text, answer text, and keyboard-focus outlines. |
| Advanced filters | Unselected check borders, selected check fills, secondary icons, footer text, hover states, and shadows. |
| Account dialogs | Introductory text, password-recovery link, fields, and backdrop colors. |
| Public profiles and personal tracking | Usernames, bios, social links, saved-schedule fields, favorites controls, and muted labels. |
| Hero and banner editors | Portrait frames, close buttons, upload surfaces, drag feedback, focus rings, helper text, and secondary action borders. |
| Revival editors | Slot-selection buttons, hover borders, and supporting text. |

## Verification

Rendered browser checks covered Home, navigation, Settings, FAQ, Find Users, the account sign-in popup, and Advanced filters. Computed-style checks confirmed that the reviewed Settings, FAQ, and Find Users surfaces no longer inherited teal interface colors. Authenticated profile, manager, and editing controls were also reviewed in source; account data and access permissions were not changed.

The existing orange Schedule divider, transparent submenu, hero hover preview, and carousel tracks remain covered by the theme stylesheet.

## Intentional colors

Weapon-color rows, portrait backgrounds, blessing badges, hero-type signatures, pool icons, and the all-colors filter indicator retain their identifying colors. The Default theme's thumbnail intentionally stays teal so visitors can compare appearances.

## Future review checklist

When adding a component or state, check its background, border, text, placeholder, shadow, checkbox accent, and focus/hover feedback under both themes. Prefer the Europa text, muted-text, and border variables in `app/themes.css` for ordinary interface elements. Preserve colors that communicate hero information.
