

# Library Tile Visual Overhaul

A purely aesthetic update to the library page tiles. No UX, navigation, or functional logic changes.

## What changes

The current dark "Obsidian Glass" tiles with heavy shadows, glows, and filters get replaced with bright, saturated, flat-color tiles matching the mockup. The overall mood shifts from moody/cinematic to playful/vibrant.

## New color palette

```text
Product          Background   Dark variant
─────────────────────────────────────────
Still Us         #94BCE1      #4B759B
Jag i Mig        #CB7AB2      #115D57
Jag med Andra    #A62755      #721B3A
Jag i Världen    #C6D423      #606613
Vardag           #8BDDB0      #48A873
Syskon           #CF8BDD      #8E459D
Sexualitet       #DD958B      #AF685E
```

Illustration opacity: 38% across all tiles.

## New illustration assets

- Copy `user-uploads://SYSKON-NY.png` to `src/assets/illustration-syskon.png` (replaces existing)
- Copy `user-uploads://jagivärlden-ny.png` to `src/assets/illustration-jag-i-varlden.png` (replaces existing)

## File changes

### 1. `src/components/ProductLibrary.tsx`

- **TILE_COLORS**: Replace all hex values with the new bright backgrounds
- **ILLUSTRATION_OPACITY**: Set all to `0.38`
- **ILLUSTRATION_SHADOW**: Remove aggressive saturation/brightness/contrast filters. Keep only a subtle drop-shadow for grounding
- **ILLUSTRATION_GLOW**: Remove or zero out — no radial glows needed on bright backgrounds
- **ACCENT_COLORS**: Update per tile — dark text on light tiles (yellow-green, mint, peach, lavender, light blue), light text on dark tiles (magenta/rose)
- **TAGLINE_COLORS**: Adjust to match new backgrounds
- **PastelTile component**: Simplify box-shadow to a clean elevation (no inset highlights, no chromatic glows). Remove dual-layer radial glow divs. Simplify or remove the bottom text scrim gradient (bright backgrounds need less protection)
- **Still Us tile** (custom block ~line 751-892): Apply same flat treatment — background `#94BCE1`, illustration at 38% opacity, remove dual radial glows, simplify shadows
- **Library background** (`libraryBg`): Keep dark or adjust to complement the bright tiles — will evaluate, but likely stays dark to let tiles pop

### 2. `src/lib/palette.ts`

- Update `productTileColors` record with the new light/mid/deep values derived from the new palette
- Update `still_us` tile colors to match `#94BCE1` family

### 3. `src/lib/stillUsTokens.ts`

- No changes needed (those tokens are for in-product surfaces, not library tiles)

### 4. `src/components/LibraryResumeCard.tsx`

- Update `PRODUCT_TILE_COLORS` to match the new tile backgrounds

## What stays the same

- All routing, navigation, product ordering logic
- Resume card functionality and realtime subscriptions
- Animation variants (stagger, hover, tap)
- Tile layout structure (illustration right, text bottom-left)
- Section headers ("Föräldrar", "Barn & Familj")
- "Era samtal" card at bottom
- All product data, card content, session logic

