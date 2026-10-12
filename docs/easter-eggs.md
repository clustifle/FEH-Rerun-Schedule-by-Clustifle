# Small secrets around Askr

A few decorations are more lively than they look.

<details>
<summary>The messenger in the header</summary>

Feh sits beside the navigation button. Hover to greet her. Tap once for a happy hop, twice quickly for a sleepy owl, and once more to wake her. She settles back into her awake pose automatically. The awake, happy and sleepy artwork changes directly in the header.

</details>

<details>
<summary>Where to look — spoilers</summary>

| Interaction | Location | Effect |
| --- | --- | --- |
| Feh | Header navigation | Happy hops and sleepy expressions. |
| Pixel owl | Scroll to the bottom of About and pause | A little hop in place. |
| Maxwell | Search Skills List for `Maxwell` | A spinning cat appears directly on the page. |
| Pedro | Double-tap a Weekly Revivals section heading | Pedro dances beside the cards. |
| Waiting meme | Scroll to the bottom of a rerun waitlist and pause | The waiting meme appears in place. |
| Anna | Close the schedule export preview | Gold coins spill into a purse. |
| Envelope | Scroll to the bottom of FAQ and pause | An envelope releases a tiny owl and a gold sparkle. |
| Seasonal visitor | Scroll to the bottom of Home and pause | October: glowing pumpkin, ghosts and bats. December: gift, snow and orbs. Other months: flowers and butterflies. |
| Search for Ferran | Find Users | Submit `Ferran` for the dog scene and shout. |

There are no Easter egg popup windows, replay controls, collection or achievement list. There are no separate clickable secret icons. Repeat the page action to reuse an effect; for scrolling discoveries, scroll up before returning to the bottom. Brief effects reset automatically, and Escape dismisses them. The shield Easter egg is removed.

</details>

<details>
<summary>The unexpected search result</summary>

In **Find Users**, submit **Ferran**. Capitalization and surrounding spaces do not matter; `@Ferran` also works. Typing alone does not trigger it, and other searches work normally.

The dog briefly takes over the screen with **FEEEERRRRRRAAAAAAAAAN!** and the supplied audio. It disappears when the audio ends, or after eight seconds at most. Click the scene or press Escape to dismiss it early. Searching again triggers it again. There is no popup frame or replay button, and the football challenge is removed.

</details>

<details>
<summary>A few practical notes</summary>

All interactions are enabled. They work with mouse, keyboard focus and taps. Reduced motion uses still meme images and disables decorative movement. Leaving a page or hiding the browser stops the Ferran scene and sound. None of the effects change hero, Forum or schedule data.

Implementation: `pages-app/EasterEggs.tsx` and `pages-app/EasterEggs.css`; source credits and media are in `public/easter-eggs`. Verification covers header spacing, the three owl expressions, direct repeatable effects, audio stopping, mobile layout and reduced motion.

</details>
