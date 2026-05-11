# Extend App Store export set with 9 bare iPhone graphics

Add graphics 8–16 to the existing `/export/app-store/{n}` route. These are **bare device frames** — iPhone frame + screen content on the canvas, no caption zone, no hairline divider, no headline copy.

## What gets added

| # | Name | Source route | Canvas/screen bg |
|---|---|---|---|
| 8 | library | `/?demo=1&devState=browse&exportFonts=1` | Midnight Ink |
| 9 | journal | (reuses pre-cropped `journal-clean.png`) | Midnight Ink |
| 10 | jag-i-mig | `/product/jag-i-mig?demo=1&devState=browse&exportFonts=1` | JIM_DEEP |
| 11 | jag-med-andra | `/product/jag-med-andra?...` | JMA palette deep |
| 12 | jag-i-varlden | `/product/jag-i-varlden?...` | JIV palette deep |
| 13 | vardagskort | `/product/vardagskort?...` | Vardags palette deep |
| 14 | syskonkort | `/product/syskonkort?...` | Syskon palette deep |
| 15 | sexualitetskort | `/product/sexualitetskort?...` | Sexualitet palette deep |
| 16 | vart-vi | `/product/still-us?...` | Deep Dusk |

Filenames on download: `app-store-{n}-{name}.png`. Same 1290×2778 canvas as graphics 1–7.

## Composition

A new render branch in `AppStoreScreenshot.tsx` keyed off a `bareFrame: true` flag on the spec:

- `AppStoreCanvas` background = `canvasBg` (matches device screen bg so the frame floats seamlessly).
- Single `DeviceFrame` centered vertically on canvas with full iOS chrome (`showChrome: true`).
- No `CaptionZone`, no `HairlineDivider`.
- Frame uses the existing `DeviceFrame` constants from `composition.tsx` — same dimensions as graphics 1–7 to keep the iPhone silhouette identical across the set.
- Vertical centering: compute `top = (CANVAS_H - FRAME_HEIGHT_PX) / 2` and override the frame position via a wrapper.

## Files touched

- **`src/pages/export/AppStoreScreenshot.tsx`** — extend `GRAPHICS` array from 7 to 16 entries; add `bareFrame?: boolean` to `GraphicSpec`; add render branch for bare-frame mode (centers the existing `DeviceFrame` on canvas, no caption/hairline). Update nav-tabs grid to wrap (16 buttons).
- **`src/pages/export/screenshots/Screen8Library.tsx`** — `RealAppFrame` pointing to `/?demo=1&devState=browse&exportFonts=1` (identical to Screen1 but kept separate for clarity).
- **`src/pages/export/screenshots/Screen9Journal.tsx`** — re-export of existing `Screen2Journal` (or use it directly in spec — no new file needed).
- **`src/pages/export/screenshots/Screen10JmaHome.tsx` … `Screen15SexHome.tsx`, `Screen16VvHome.tsx`** — one `RealAppFrame` per product slug. Six new files (jag-med-andra, jag-i-varlden, vardagskort, syskonkort, sexualitetskort, still-us). Reuse existing `Screen3JimHome.tsx` for jag-i-mig (graphic 10) — or add `Screen10JimHome.tsx` for naming consistency; pick one (recommend reusing `Screen3JimHome`).

Total new files: 7 (one library + six product homes; journal and jag-i-mig reuse existing screen components).

## Canvas backgrounds per product

Pulled from `productTileColors` deep variants (mem://design/product-color-palette-mapping). Falls back to MIDNIGHT_INK if a palette is unclear — verified against `src/lib/palette.ts` during implementation.

## What's intentionally NOT changed

- `composition.tsx` — untouched; reuses existing `DeviceFrame`, `AppStoreCanvas`, constants.
- `compositionAndroid.tsx` — untouched.
- `GooglePlayScreenshot.tsx` — untouched (no Google Play counterparts requested).
- Graphics 1–7 — pixel-identical, no regression.
- Export pipeline (`exportPng.ts`, raw mode for puppeteer) — works as-is for new graphics.

## Verification

- All 16 routes render (`/export/app-store/1` … `/export/app-store/16`).
- Bare graphics (8–16) show only iPhone frame + screen, no caption text, no hairline.
- Each product home shows production content with all categories/cards unlocked (browse mode).
- PNG download produces 1290×2778 file with correct filename.
- Nav tabs at top of preview wrap cleanly with 16 buttons.
