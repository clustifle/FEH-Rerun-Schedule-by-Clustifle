# Fire Emblem Heroes theme assets

- `feh.ttf`: supplied by the project owner as Fire_Emblem_Heroes_Font (1).ttf.
- `wallpaper.webp`: supplied by the project owner as BG_Wallpaper.webp.
- `Common.webp`, `Common_Button.webp`, `Common_Window.webp`, `SRPGStatus.webp`: downloaded from the UI Sprite sheets section of https://feheroes.fandom.com/wiki/Game_assets_collection#UI_Sprite_sheets through its public MediaWiki API. No assets from other sections were used.

The stylesheet uses positions within the original sprite sheets; no game illustrations or character artwork were added for the theme. Game assets remain © Nintendo / INTELLIGENT SYSTEMS.

`feh.woff2` is a web subset of the supplied font, covering Latin, accented Latin, Greek, Cyrillic and common punctuation. Malformed OpenType layout tables in the original were omitted from the subset; the supplied original remains unchanged.

The SRPG Status sheet supplies an empty blue status strip for rerun-window month headers. Sprite regions are displayed with CSS; no game statistic text is used.

Browser and PWA icons use the project-owner-supplied `feh site icon symbol.png`, resized with padding onto a dark teal background. The maskable variant keeps the symbol inside its safe area.
