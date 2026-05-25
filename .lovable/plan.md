## Goal
Apply a neumorphic ("soft UI") treatment to all tiles on the library lobby (`/`) so they appear extruded from the new mint shell `#e9f6f4`.

## Scope
Only `src/components/ProductLibrary.tsx`. Three tile types share one shadow language:
1. `LibraryKidsTile` — six kids product tiles on the Barnen tab
2. `VartViHero` — the large "Vårt Vi" hero tile on the Vi tab
3. `PreviewCardPurchased` + the unpurchased preview medallions — the 4 preview tiles under the Vårt Vi hero

## Neumorphic recipe (single shared language)

Resting state — soft double shadow off a near-bg surface:
```
boxShadow:
  '8px 8px 20px rgba(166, 195, 192, 0.55),   // bottom-right shadow (darker mint)
   -8px -8px 20px rgba(255, 255, 255, 0.9)'  // top-left highlight (white)
border: 'none'   // neumorphism uses shadow, not stroke
background: '#e9f6f4'  // matches shell — colored content sits inside via inner plates/illustrations
```

For tiles that today carry a saturated frame color (kids tiles' `frame`, Vårt Vi's storm grey), keep that color **only on the inner plate / illustration well**, and let the outer tile body inherit the mint shell so the extrusion reads. The colored interior plate gets a subtle inset shadow:
```
boxShadow (inner plate):
  'inset 3px 3px 6px rgba(0,0,0,0.12),
   inset -3px -3px 6px rgba(255,255,255,0.18)'
```

Pressed state (active/tap) — invert to inset:
```
boxShadow:
  'inset 6px 6px 14px rgba(166,195,192,0.55),
   inset -6px -6px 14px rgba(255,255,255,0.9)'
```
Applied via `:active` pseudo or `whileTap` (the tiles are `<button>` / framer `motion.button`, so an inline `onPointerDown/Up` toggle is fine).

Radius bumped to `20px` on the outer tile; inner plate stays `12–14px`.

## Per-tile changes

**LibraryKidsTile (lines ~600–730)**
- Outer `<button>`: remove `border`, swap `boxShadow` to the recipe above, set `backgroundColor: '#e9f6f4'` (was `frame`).
- Inner zone (lines ~622–636): keep `backgroundColor: interior` and add the inset shadow recipe. Drop the `border: 1px solid ${darkText}30` hairline.
- Title strip (bottom 24%): currently sits on `frame`. Change to sit on the mint shell with the title text in `darkText` color for contrast (kids text colors from `productDarkText`). Drop the "hairline at seam" since there's no longer a color seam.
- Progress bar + age badge: unchanged (still legible on the colored inner plate).

**VartViHero (lines ~150–280)**
- Outer `<button>`: swap to neumorphic outer shadow on mint, drop the `boxShadow: '0 0 0 1px rgba(255,255,255,0.06)'` 1px stroke, keep `background: VI_TAB_HERO_COLOR` (Storm Grey) as the **inset plate** — wrap the illustration + label + progress in an inner div that holds the storm-grey color with the inset shadow, while the outer button is mint.
- Text colors on the inner plate stay cream (already legible on storm grey).

**PreviewCardPurchased (lines ~478–559)** and **unpurchased preview medallions (lines ~335–397)**
- Replace the `boxShadow: '0 0 0 1px rgba(255,255,255,0.06)'` 1px stroke with the neumorphic outer shadow recipe.
- For purchased cards: outer button mint, inner colored swatch with inset shadow holding image + title.
- For medallions (already circular): wrap the outer circle in a mint base with the neumorphic shadow, keep the existing colored inner circle as the inset plate.

## Shared helper
Add two small constants near the top of the file to avoid repetition:
```ts
const NEU_SHADOW_OUT = '8px 8px 20px rgba(166,195,192,0.55), -8px -8px 20px rgba(255,255,255,0.9)';
const NEU_SHADOW_IN  = 'inset 3px 3px 6px rgba(0,0,0,0.12), inset -3px -3px 6px rgba(255,255,255,0.18)';
const NEU_SHADOW_PRESSED = 'inset 6px 6px 14px rgba(166,195,192,0.55), inset -6px -6px 14px rgba(255,255,255,0.9)';
```

## Out of scope
- Resume banner, tabs, bottom nav, helper copy — unchanged from current state.
- Other pages (ProductHome, Diary, etc.) — unchanged; they keep their existing shadow language.
- No new design tokens in `index.css`; this is a localized lobby treatment. If you later want this reusable across products, we can promote `NEU_SHADOW_*` into CSS vars then.

## Risks / notes
- Neumorphism needs the surface and the shell to be the **same color** for the extrusion illusion. That's why this works now (we just moved to `#e9f6f4`) but would fail if the shell were dark again.
- On very small viewports the 8px shadow spread can clip against the screen edge. The lobby already has `px-5` padding which is enough room.
- Pressed-state inversion via `onPointerDown` is one extra state variable per tile component; trivial.
