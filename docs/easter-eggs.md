# A small secret in Askr

Something looks a little out of place. Try touching it.

<details>
<summary>A feather-shaped clue</summary>

Small objects hide in the main website's decorative margins. Click or tap one to see what happens. They remain in place and can be used again whenever you return.

There is no collection, achievement list or secret password. Sound plays after an interaction; closing the reveal stops it. The site's reduced-motion preference uses still images and simple transitions.

</details>

<details>
<summary>Where to look — location spoilers</summary>

| Object | Location | What happens |
| --- | --- | --- |
| Feather and envelope | Homepage footer | Feh delivers another random message. |
| Tiny pixel owl | About page, below the artwork and credits | The messenger hops out. |
| Football | Homepage, below the revival cards | The Prime Ferran finishing challenge. |
| Cat ears | Skills List footer | Maxwell spins; Stop spinning pauses him. |
| Raccoon paw | Weekly Revivals decorative corner | Pedro dances. |
| Steaming cup | Bottom of the rerun waitlist | A waiting-for-reruns meme. |
| Gold coin | Beside schedule export | Anna's completely imaginary special offers. |
| Shield | Navigation menu footer | A friendly greeting. |
| Forgotten envelope | Below the last visible FAQ answer | Another joke from Askr. |
| Pumpkin, gift or flower | Homepage footer | A seasonal Feh delivery. |

The same objects work with keyboard focus and Enter, and have comfortable tap areas on phones. Open a reveal again or use its replay control as often as you like.

</details>

<details>
<summary>The football — more spoilers</summary>

An empty goal. A red-and-blue striker. Surely this time.

Press **Shoot**. The ball might sail over the bar, miss wide, hit the corner flag, escape the popup, barely move after a slip, or enter the wrong goal. Every result ends with the dog meme and **FEEEERRRRRRAAAAAAAAAN!**

Use **Shoot again**, **Trust the process**, or **One more chance** to try again. The attempt counter belongs only to this little game and resets when it closes. It is an exaggerated Barcelona fan joke, not a real statistic or a gameplay record.

</details>

<details>
<summary>If a surprise is hard to spot</summary>

Look near page footers and decorative margins. The objects brighten on hover and keyboard focus. Some only appear on their particular page; the shield is inside the navigation menu, and the pixel owl is inside About.

Audio needs an interaction with the page and may be affected by browser or device volume settings. Closing a popup stops its sound. No Easter egg changes hero, Forum or schedule data.

</details>

<details>
<summary>Maintenance notes</summary>

The ten objects, placement selectors, messages and football outcomes live in `pages-app/EasterEggs.tsx`. Styling is in `pages-app/EasterEggs.css`. Media and source credits live in `public/easter-eggs`. Animated media loads when revealed, with still versions for reduced motion.

Verification: TypeScript, production builds and `scripts/easter-eggs-ui-check.mjs`, covering every location, repeated activation, football outcomes, audio stopping, phone layout and reduced motion.

</details>
