# Final scrim pass — neutralize the top-corner vignette

The cropped top-half of your screenshot shows a darker patch behind the "FORTSÄTT" eyebrow, strongest toward the right edge, fading toward the page center. The previous edits removed the mid-page wash and softened the top fade, but two atmospheric layers are still creating that corner darkening:

```text
// top-left
position: absolute; top: 0; left: 0; width: 50%; height: 400px;
radial-gradient(ellipse 80% 70% at 0% 0%, rgba(74, 58, 107, 0.06) 0%, transparent 70%)

// top-right
position: absolute; top: 0; right: 0; width: 50%; height: 400px;
radial-gradient(ellipse 80% 70% at 100% 0%, rgba(74, 58, 107, 0.06) 0%, transparent 70%)
```

Even at 6% opacity, violet (74,58,107) over the navy `#1A1A2E` background reads as a slight darkening rather than a glow because the violet sits at similar luminance to the base. The eye reads it as a corner scrim.

## Fix

In `src/components/ProductLibrary.tsx`, atmospheric layers block:

1. **Remove both top-corner violet radial glows** entirely.
2. Keep:
   - the green ambient highlight at the very top (`hsla(100, 60%, 80%, 0.10)`) — adds a hint of warmth without darkening
   - the bottom green wash (off-axis from any eyebrow)
   - the soft top fade (now 220px, 0.08→0.18)

Net effect: the top region becomes evenly dark with only the central green halo, no corner vignette behind FORTSÄTT or FÖR ER SOM PAR.

## Verification

- 390×844 preview, top of library: confirm no darker corners behind the FORTSÄTT eyebrow band
- Scroll: confirm no banding anywhere
- Header "Biblioteket" still feels intentional, not flat

## Out of scope

No typography, copy, palette, tile, or routing changes.
