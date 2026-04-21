

## Refine the lantern banner to 10/10

Three visual fixes plus the color bug — one file each, no scope creep.

### Files touched
1. `src/components/ResumeBanner.tsx` — visual refinements
2. `src/pages/Categories.tsx` — color resolution fix

### What changes

**1. Make the accent dot actually visible (`ResumeBanner.tsx`)**
- Current: 4px dot at full accent color, swallowed by the bloom behind it.
- Fix: increase to **6px**, add a subtle dark halo (`box-shadow: 0 0 0 1.5px #0B1026`) so it punches through the glow as a crisp point of identity. Lift to `z-index: 2` (above the bloom, same layer as text).

**2. Tighten title hierarchy (`ResumeBanner.tsx`)**
- Current: "Ert samtal väntar." and "Där ni senast slutade." read as siblings, both at 12px secondary.
- Fix:
  - Primary line ("Ert samtal väntar."): bump to **14px**, weight **500**, color `LANTERN_GLOW` (`#FDF6E3`) — this becomes the *what*.
  - Secondary line ("Där ni senast slutade."): keep 12px, drop opacity to **0.55**, color `DRIFTWOOD` (`#6B5E52`) — this recedes as the *where*.
  - Remove the awkward `paddingLeft: 12px` hack on the second line; align both lines to the dot's right edge via flex gap.

**3. Nudge the bloom left so the pill emerges from shadow (`ResumeBanner.tsx`)**
- Current: `radial-gradient(ellipse 320px 140px at 30% 50%, ...)` — visually reads more centered because the ellipse is wide.
- Fix: tighten ellipse to `260px 120px` and shift center to `at 22% 50%`. The bloom now anchors firmly behind the text on the left half; the right half (where the orange pill sits) stays in the dark Midnight Ink shell. Pill reads as emerging from shadow, not floating in light.
- **Color intensity stays at `33` (20%) peak and `10` (6%) midpoint as currently specified — no reduction.**

**4. Fix the wrong-color bug (`Categories.tsx`)**
- Current symptom: Jag i Mig active → banner shows lilac/cream instead of teal (`#27A69C`).
- Investigation: the `getProductForCard(effectiveCardId)` lookup is either returning `undefined` (falling through to cream default) or returning the wrong product (cards with overlapping/ambiguous IDs).
- Fix:
  - Verify `effectiveCardId` is the *resume* card, not a stale value.
  - Add explicit logging during dev (`if (import.meta.env.DEV) console.log('[ResumeBanner accent]', { effectiveCardId, productId: product?.id, tileLight: product?.tileLight })`) so future regressions are immediately visible in console.
  - If `getProductForCard` returns nothing, fall back by parsing the card ID prefix (`jim-` → jag_i_mig, `jma-` → jag_med_andra, etc.) using `productTileColors` from `src/lib/palette.ts`. This guarantees a correct color even if the manifest lookup fails.
  - Pass the resolved `tileLight` to `<ResumeBanner accentColor={...} />` exactly as before.

### What is NOT touched
- `UnifiedResumeBanner.tsx`, `ContinueModule.tsx`, `NextActionBanner.tsx` — still untouched. Lantern stays scoped to library resume until confirmed at 10/10.
- Bloom opacity, breathing animation timing, pill style, dismiss button — all preserved.
- `palette.ts`, product manifests, memory files — read-only.

### How to judge it
Open `/?devState=pairedActive` on the library home. Expect:
- Bloom is teal (`#27A69C` at low opacity), clearly Jag i Mig.
- A crisp 6px teal dot with a thin dark halo sits left of the primary line — visible and sharp against the glow.
- "Ert samtal väntar." is the dominant line; "Där ni senast slutade." recedes.
- The Bonki Orange pill sits in the darker right half of the banner, reading as emerging from shadow.
- Switch `devState` or active card to a different product → bloom and dot color change correctly (rose for Jag med Andra, lilac for Syskonkort, cobalt for Vårt Vi).
- Console (dev only) logs the resolved product + tileLight on render — confirms no fallback misfire.

### Revert cost
Two files. One click per file.

