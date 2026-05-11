## Problem

Scaling the wrapper `div` with CSS `transform: scale()` blows up the entire device — frame, bezel, and iframe contents — proportionally. The iframe still renders at the same logical viewport (`390 × ~616` CSS pixels), so the user sees the *same* slice of the app, just bigger. No additional app content becomes visible.

## Root cause

`DeviceFrame` has hardcoded dimensions (`FRAME_WIDTH_PX = 1079`, `FRAME_HEIGHT_PX = 1689`). `RealAppFrame` imports those same constants to compute its iframe's logical height (`logicalH = innerH / scale ≈ 616`). Wrapping in `transform: scale(1.166)` doesn't change either — it just rescales the rendered pixels.

To show **more** app content, the iframe itself must be rendered at a **larger physical size** (taller inner screen → taller logicalH → more vertical content fits before the iframe is clipped).

## Fix

Render a dedicated larger device for bare graphics instead of scaling. Make `DeviceFrame` + `RealAppFrame` accept width/height props.

### Changes

**1. `src/lib/exportScreenshot/composition.tsx`**
- Add optional `width` / `height` / `top` props to `DeviceFrame` (defaults stay `FRAME_WIDTH_PX` / `FRAME_HEIGHT_PX` / `FRAME_TOP_PX` so graphics 1–7 are unchanged).
- Export new constants for bare-frame size, e.g.:
  - `BARE_FRAME_WIDTH_PX = 1258` (≈ 98% of 1284)
  - `BARE_FRAME_HEIGHT_PX = 2580` (fills canvas vertically with ~99 px breathing room top & bottom; preserves iPhone-ish aspect closely enough — the bezel curve still reads as iPhone)
  - `BARE_FRAME_TOP_PX = (2778 - 2580) / 2 = 99`

**2. `src/pages/export/screenshots/RealAppFrame.tsx`**
- Accept optional `frameWidth` / `frameHeight` props. Compute `innerW`/`innerH` from these instead of the global constants.
- Result: iframe `logicalH = innerH / scale` grows from ~616 → ~795 CSS px, so ~30 % more app content fits vertically.

**3. `src/pages/export/screenshots/BareProductScreens.tsx`**
- Pass the bare frame dimensions through to `RealAppFrame` so its iframe sizes match.

**4. `src/pages/export/AppStoreScreenshot.tsx`**
- Remove the wrapper-level `transform: scale()` for the `bareFrame` branch.
- Render `<DeviceFrame width={BARE_FRAME_WIDTH_PX} height={BARE_FRAME_HEIGHT_PX} top={BARE_FRAME_TOP_PX}>` with `<Screen frameWidth=... frameHeight=...>` inside.

### Untouched

- Graphics 1–7 (default `DeviceFrame` args identical to today's behaviour).
- `compositionAndroid.tsx`, `GooglePlayScreenshot.tsx`.
- Capture pipeline (still 1284×2778).
- Screen content components — they render whatever route they target; the iframe just exposes more of it.

### Numbers

```text
Canvas:           1284 × 2778
Old bare frame:   1079 × 1689   (scaled 1.166× = 1258 × 1970 pixels, but iframe content unchanged)
New bare frame:   1258 × 2580   (real larger device, iframe gets ~795 CSS px tall → +30% content)
Top margin:       99 px         (centers vertically)
```
