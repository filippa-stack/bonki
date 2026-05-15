# Remove the remaining scrim over library section eyebrows

Last pass softened the top fade (280px) but the perceived dark band over "FÖR BARN · FÖR FAMILJEN" is coming from a different layer further down the page. That eyebrow sits around y≈540–600px on a 390×844 viewport — well below the 280px top fade, so softening it didn't help.

## Diagnosis

In `ProductLibrary.tsx`, the atmospheric stack has a **mid-page blue/violet wash**:

```text
position: absolute; top: 350px; height: 600px;
linear-gradient(180deg,
  transparent 0%,
  rgba(26, 39, 68, 0.08)  30%,   // ≈ y=530, right under the marquee
  rgba(74, 58, 107, 0.05) 60%,
  transparent 100%)
```

That layer covers y≈350–950px — exactly the region containing the "För barn · För familjen" eyebrow and the disclaimer. It reads as a dark wash sitting on the eyebrow.

There is also still the top fade (now 280px, 0.15→0.35 mid-stops) and a bottom green wash from y=900 down — those are not in the eyebrow band but contribute to overall murkiness.

## Fix

Two targeted edits in `src/components/ProductLibrary.tsx`, both inside the atmospheric layers block:

1. **Remove the mid-page blue/violet wash entirely** (the `top: 350px, height: 600px` div). Nothing about the brand identity depends on it; it just dims the eyebrow band.
2. **Further soften the top fade** so the page header area is calm but not heavy:
   - height `280px → 220px`
   - mid-stops `0.15 → 0.08` (30%) and `0.35 → 0.18` (55%)

Keep the corner radial glows (top-left / top-right violet) and the green ambient wash at the bottom — those are off-axis from the eyebrow and add atmosphere without darkening the section title band.

## Verification

- 390×844 preview: scroll the library top-to-bottom and confirm no horizontal darker stripe sits over either eyebrow ("För er som par", "För barn · För familjen").
- Marquee tile and kids tiles still read against background with no halo.
- Header "Biblioteket" still feels grounded (top fade, just lighter).

## Out of scope

No changes to typography, copy, palette tokens, tile structure, or any other surface.
