

# Portal Tile Redesign — Bright Two-Layer Layout

Replace the dark "Obsidian Glass" portal tile with a bright two-layer structure matching the mockups. All copy, links, CTAs, navigation, and animation logic remain untouched.

## Changes — `src/pages/KidsCardPortal.tsx`

### 1. Tile structure (lines ~364-557)

Replace the single dark tile with a two-layer layout:

```text
┌─────────────────────────┐  outer: product.backgroundColor, rounded 20px, padding 10px
│  ┌───────────────────┐  │
│  │   illustration    │  │  inner: product.tileLight, rounded 16px, overflow hidden
│  │   (full opacity)  │  │  illustration: objectFit contain, opacity 1, no filters
│  └───────────────────┘  │
│       Card Title        │  title below inner frame, centered
└─────────────────────────┘
```

- **Outer div**: `backgroundColor: tileBg` (product.tileLight), `borderRadius: 20px`, `padding: '10px 10px 16px'`
- **Inner div**: `backgroundColor: product.backgroundColor`, `borderRadius: 16px`, `overflow: hidden`, holds illustration
- Title moves below the inner frame (still inside outer), centered, `LANTERN_GLOW`

### 2. Remove decorative layers
- **Saffron glow frame** (lines 344-361) — remove
- **Ceramic glaze highlight** (lines 438-451) — remove
- **Bottom scrim gradient** (lines 453-465) — remove
- **Ceramic rim / obsidian glass bevel** (lines 492-507) — remove
- **Ghost border** (lines 509-519) — remove
- **Outer chromatic glow elevation** (lines 560-575) — remove

### 3. Illustration cleanup
- `opacity: 0.92` → `1`
- `filter: 'saturate(1.05) contrast(1.03)'` → `'none'`

### 4. Surface cleanup
- Remove `backgroundColor: 'rgba(15, 15, 15, 0.7)'` and `backdropFilter` from tile
- Remove background radial glow div (lines 237-248)

### 5. Keep unchanged
- All portal-open animation phases (scale/brightness/opacity transitions)
- Completion/active indicators (move to inner frame)
- All copy, links, CTAs, swipe handling, browse sheet, routing
- Still Us warm-light and kids zoom-through overlays

## Files touched
1. `src/pages/KidsCardPortal.tsx` only

