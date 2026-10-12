# Anna's Secret Stash

Main website only. Open the sparkle button in the lower-right corner, or Settings > Personalization > Easter eggs. The collection has 12 discoveries with replay controls and clues. Discoveries are saved per device; they do not modify hero, Forum or schedule records.

Typing these words outside input fields reveals an egg: `feh`, `pixel`, `wrys`, `ferran`, `maxwell`, `pedro`, `fine`, `fomortiis`, `anna`, `greetings`, `quote`, `seasonal`. Tapping the site logo five times reveals Feh. The sequence Up Up Down Down Left Right Left Right B A reveals the greeting. Keyboard triggers pause inside editors and open dialogs, have a 1.5-second cooldown, and run once per egg per session. The collection's explicit replay buttons remain available.

Sound and spooky surprises default to off. The Cursed Orb requests an explicit opt-in. Ferran uses the owner's MP3, with playback/stop controls. Audio stops on closing the popup, returning to the collection, opening another egg, or disabling sound. Reduced motion uses still versions of animated memes. The seasonal message changes in October and December.

Maintain names, clues and messages in `pages-app/EasterEggs.tsx`. Assets are bundled under `public/easter-eggs`, with sources in `credits.txt`. Animated WebP files are loaded only when revealed. The full public asset pack is approximately 1.15 MB; Pedro's original 40.7 MB GIF is compressed to 466 KB. Original large files are excluded from the build.

Verification: TypeScript, production builds and `scripts/easter-eggs-ui-check.mjs`. The browser check covers all reveals, audio, explicit spooky opt-in, persistence, logo/keyboard triggers, phone layout, reduced motion, multiple themes and feature disabling.
