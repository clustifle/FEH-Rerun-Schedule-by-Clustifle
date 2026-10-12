# A small secret in Askr

Some deliveries are easier to find than others.

<details>
<summary>A feather-shaped clue</summary>

1. Open the main website's menu, then **Settings → Personalization**.
2. Find **Easter eggs** and turn **Hidden surprises** on. It is enabled by default; turn it back on here if previously disabled.
3. Select **Open Anna’s Secret Stash**, or close Settings and tap the **✦** button at the bottom-right.
4. Choose a clue to reveal a surprise. Discovered entries can be replayed anytime from the collection.

These surprises work on the main website. Discoveries are saved on the current browser and device.

</details>

<details>
<summary>A slightly louder clue</summary>

**Sound** starts off. Enable **Easter egg sound** in Settings, or enable **Sound** inside the collection. The Ferran reveal also has a **Play Ferran audio** button.

**Spooky surprises** starts off separately. Enable it in Settings or the collection to allow the Cursed Orb reveal. Opening that orb while the option is off shows a confirmation first.

Closing a surprise stops its sound. The site's reduced-motion setting replaces animated memes with still images.

</details>

<details>
<summary>The full list of secret words — spoilers</summary>

Type a word while focused on the page, outside search boxes and other text fields:

| Word | Discovery |
| --- | --- |
| `feh` | Special delivery |
| `pixel` | Pocket-sized messenger |
| `wrys` | The legendary pity breaker |
| `ferran` | The unexpected striker |
| `maxwell` | A very unusual familiar |
| `pedro` | Dance of the raccoon |
| `fine` | Perfectly reasonable waiting |
| `fomortiis` | The Cursed Orb |
| `anna` | Anna’s special offer |
| `greetings` | Nothing to report! |
| `quote` | A message from Askr |
| `seasonal` | A visiting messenger |

You can also tap the site logo **five times**, or enter **↑ ↑ ↓ ↓ ← → ← → B A**.

Keyboard triggers pause inside editors and open dialogs. Type steadily: a gap longer than two seconds clears the sequence. Hidden triggers have a short cooldown and run once per discovery per session; use the collection to replay them. On phones, use the collection's clue buttons.

</details>

<details>
<summary>If the delivery seems lost</summary>

- Confirm **Hidden surprises** is on.
- Close other dialogs and leave text fields before typing a secret word.
- Wait briefly between hidden triggers, or replay directly from the collection.
- If audio does not start automatically, press **Play Ferran audio**.
- Browser data clearing or a different browser starts a separate discovery collection.

To switch everything off, disable **Hidden surprises** in Settings.

</details>

<details>
<summary>Maintenance notes</summary>

The seasonal message changes in October and December. Discoveries do not modify hero, Forum or schedule records.

Maintain names, clues and messages in `pages-app/EasterEggs.tsx`. Assets are bundled under `public/easter-eggs`, with sources in `credits.txt`. Animated WebP files are loaded only when revealed. The full public asset pack is approximately 1.15 MB; Pedro's original 40.7 MB GIF is compressed to 466 KB. Original large files are excluded from the build.

Verification: TypeScript, production builds and `scripts/easter-eggs-ui-check.mjs`. The browser check covers all reveals, audio, explicit spooky opt-in, persistence, logo/keyboard triggers, phone layout, reduced motion, multiple themes and feature disabling.

</details>
