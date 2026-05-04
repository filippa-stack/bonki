## Problem

The figure's silhouette is visible at the top of the paywall, but her face and upper body are obscured by a solid black band. This isn't a positioning issue — the illustration container is tall enough and the figure sits in the right place. The cause is the fade gradient over the illustration: it currently fills the bottom 40% of the container with solid Midnight Ink, then fades from there.

That solid band lands directly on her face.

## Fix

Single value change in `src/components/PaywallMock.tsx`, line 155 — the gradient overlay inside the illustration backdrop container.

Current:
```
background: `linear-gradient(to top, ${MIDNIGHT_INK} 0%, ${MIDNIGHT_INK} 40%, transparent 100%)`
```

New:
```
background: `linear-gradient(to top, ${MIDNIGHT_INK} 0%, transparent 100%)`
```

This removes the solid 0–40% midnight band and lets the fade run smoothly from full midnight at the bottom edge to fully transparent at the top. Her face becomes visible; the bottom of the container still merges cleanly into the page background so the editorial zone below ("FÖRSTA SAMTALET · KLART", headline, etc.) remains anchored on stable midnight ink.

No other changes — container height (52vh), positioning map, image opacity, and all editorial/commit zone layout stay exactly as they are.

## Files

- `src/components/PaywallMock.tsx` — single line edit (line 155, gradient stops)
