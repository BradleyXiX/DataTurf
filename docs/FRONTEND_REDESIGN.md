# DataTurf Research Studio redesign brief

DataTurf is a football research portfolio piece. A client should be able to pick a matchup, change venue, see which matches contributed to a result, and open a club report. The stadium introduces the subject. The evidence is what makes the product credible.

## Visual direction

Use the visual structure of a football broadcast and a scouting report. Keep the original Blender stadium as the one large visual on Explore. Use the same charcoal, warm white, pitch green and Geist palette from the prototype. Keep green for primary actions and active selections. Reserve amber for genuine data warnings. Keep the preview mode selector in the experiment only.

The design review used Web UI Studio as the primary workflow and the Redesign Existing Projects skill to diagnose generic patterns. Repeated equal-weight cards, heavy rounding, and a hero treated as a boxed feature all weaken hierarchy. Apply the changes below in the corresponding implementation commits.

| Page | Implementation decision |
| --- | --- |
| Explore | Give the stadium its own image area that sits against the page background. Keep the native matchup controls close to the hero and visible before the model loads. Use a compact season and coverage line from the snapshot. Show the standings as a ruled table and place fixture evidence alongside it on wide screens. |
| Compare | Replace the repeated desktop cards with a match sheet. Use one metric label and two aligned values. Use tabular numerals, visible sample counts and clearly labeled club columns. At narrow widths, use a stacked list of metric rows with both values visible in each row at 320 CSS px. Keep the venue control and evidence jump in the same reading order. |
| Club | Lead with the club identity and key league figures in a compact team summary. Follow with dated, chronological fixture rows, clear results and a contextual link back to comparison. |
| Shared | Use a few purposeful surfaces and thin rules to group related information. Prefer functional labels, real fixture data and authentic source status to decorative badges or filler. Preserve keyboard focus, copyable query URLs, Back navigation, and explicit demo attribution. |

Keep the current Figma draft as the layout reference. The match-sheet treatment and changes to the hero framing are implementation refinements proposed in this brief.

## Motion

| Interaction | Already in Explore trial | Implementation and verification |
| --- | --- | --- |
| Stadium camera | The Blender model moves through the opening corner angle, center-circle reveal and settling diagonal. Normal scroll moves the camera forward and backward. The renderer draws on demand and stops offscreen. | Use one owner for camera position, target and zoom. Keep native scrolling and the hero size stable. Do not autoplay an orbit. Check reversals, viewport changes, context loss, cleanup and hardware frame pacing. |
| Poster to model | The optimized WebP is present first. The rendered model fades in over about 200 ms once its first frame is ready. | Keep the poster visible on phones and when reduced motion or WebGL failure applies. If the asset request fails, release the unused renderer promptly and leave the poster in place. |
| Venue changes | The stadium trial preserved the existing venue controls. This feedback refinement has yet to be built. | Update the selected state immediately, keep keyboard focus steady and show a compact pending state when a response takes time. A short opacity transition may settle the new evidence while preserving row position. Use static feedback for reduced motion. |
| Small controls | The stadium trial was scoped to the hero. | Use a brief color or opacity transition for hover and press where helpful. Keep focus visible immediately. Keep scores and core content readable from the first paint. |

## Baseline and stadium decision

Baseline commit is `3680291b6e932fbbc7916c6af5b4df598d512bde`. In a clean dependency install, start Next.js from `frontend` and open `/?demo=true`. Use the default Liverpool–Arsenal comparison, switch to Home only, and open Liverpool. The bundled demo needs no API key. Check the unavailable state without the demo query.

The baseline was captured with Next.js 16.3.1 production webpack, cached Geist fonts and Chrome 157 at 1440 × 1000 and 390 × 844. At 390 px the opening comparison view clipped part of Arsenal's column inside its scroll container. Mobile lab runs at 4× CPU had median LCP of 2.94 s on Explore, 1.31 s on Compare and 1.61 s on Club. All 16 snapshot and metrics tests passed.

Select the Blender model for eligible desktop Explore and the 47,932-byte WebP poster as the default visual. The local comparison used 1440 × 960 headless Chrome with software WebGL and cache disabled, three runs per mode. The model added 110,800 encoded bytes and recorded zero idle WebGL draw calls per 450 ms. The procedural renderer recorded a median of 198. Timings varied and establish no startup speed advantage. Confirm production transfer and hardware frame pacing before release. Compare and Club must have zero stadium asset requests.

Baseline captures, Blender source and trial evidence are available in the Codex redesign handoff. Review them alongside the editable design and camera storyboard. [Figma layout draft](https://www.figma.com/design/tKRS0xr4tCT6Cf8tmCN8ad?node-id=3-166) · [Stadium storyboard](https://www.figma.com/design/tKRS0xr4tCT6Cf8tmCN8ad?node-id=3-124)
