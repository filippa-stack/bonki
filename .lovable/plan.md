## Fix: bare iPhone graphics (8–16) render at full canvas size

### Problem

Graphics 8–16 reuse the same `DeviceFrame` dimensions (1079 × 1689 px) that graphics 1–7 use, where the frame intentionally only fills the bottom ~60% of the 1284 × 2778 canvas — the top ~35% is reserved for the caption zone. Since the bare graphics have no caption, the frame is just floating small in the middle of the canvas with huge empty bands above and below.

### Fix

When `bareFrame: true`, render the device frame at an enlarged size so it visually fills the canvas (small uniform margin), keeping the same aspect ratio so the iPhone silhouette stays correct.

**Sizing math** (in `AppStoreScreenshot.tsx`, only for the `bareFrame` branch):

- Canvas: `1284 × 2778`
- Original frame: `1079 × 1689` (aspect `0.639`)
- Target: scale frame uniformly to `~98%` of canvas width → `width ≈ 1258`, `height ≈ 1970`. Vertically centered → top ≈ `404`.
- Scale factor: `1258 / 1079 ≈ 1.166`.

Implementation approach: wrap `<DeviceFrame>` in a positioned div that applies a CSS `transform: scale(1.166)` with `transformOrigin: 'top left'`, then translate it to center on canvas. This keeps `DeviceFrame` itself unchanged (so the bezel/corner-radius/screen content all scale together as one unit, including the iframe) and is isolated to the bare-frame branch — graphics 1–7 are untouched.

```text
Before                          After
┌──────────────────┐            ┌──────────────────┐
│                  │            │  ┌────────────┐  │
│   (empty band)   │            │  │            │  │
│                  │            │  │            │  │
│   ┌──────────┐   │            │  │   iPhone   │  │
│   │  iPhone  │   │            │  │            │  │
│   │          │   │            │  │            │  │
│   └──────────┘   │            │  │            │  │
│                  │            │  └────────────┘  │
│   (empty band)   │            │                  │
└──────────────────┘            └──────────────────┘
```

### Files touched

- **`src/pages/export/AppStoreScreenshot.tsx`** — replace the current `bareFrame` render branch:
  - Compute `BARE_SCALE = (CANVAS_W * 0.98) / FRAME_WIDTH_PX`.
  - Compute scaled frame width/height; center on canvas.
  - Wrap `<DeviceFrame>` in a div with `position: absolute`, `left/top` for centering, and `transform: scale(BARE_SCALE)` with `transformOrigin: 'top left'`.

### Not changed

- `composition.tsx` constants (`FRAME_TOP_PX`, `FRAME_WIDTH_PX`, etc.) — unchanged so graphics 1–7 remain pixel-identical.
- `DeviceFrame` internal markup — unchanged.
- iframe / `RealAppFrame` — unchanged (it sizes relative to `FRAME_WIDTH_PX`, and the CSS scale wraps everything as a single unit).
- Caption/hairline branches — unchanged.

### Verification

- `/export/app-store/8` through `/16`: iPhone frame visually fills the canvas with ~1.3% margin per side, no large empty bands.
- iPhone silhouette aspect ratio preserved (no stretching).
- Status bar, screen content, and home indicator all scale together cleanly.
- Graphics 1–7 unchanged in preview and PNG export.
- PNG export still produces 1284 × 2778.
