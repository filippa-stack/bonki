

## Regenerate IAP icons using the actual library tile colors

You're right to push back. The previous output used `manifest.backgroundColor` (the deepest tile variant), which doesn't match what users see anywhere. The library tile is the canonical "this is the product" surface — it's where users decide to buy. The IAP icon should mirror that.

### Confirmed library tile backgrounds (from `ProductLibrary.tsx`)

| Product | Library tile color | Source |
|---|---|---|
| Jag i Mig | `#27A69C` (teal) | `TILE_COLORS.jag_i_mig`, line 54 |
| Jag med Andra | `#CB7AB2` (rose) | `TILE_COLORS.jag_med_andra`, line 55 |
| Jag i Världen | `#C6D423` (chartreuse) | `TILE_COLORS.jag_i_varlden`, line 56 |
| Vardag | `#8BDDB0` (mint) | `TILE_COLORS.vardagskort`, line 58 |
| Syskon | `#CF8BDD` (lilac) | `TILE_COLORS.syskonkort`, line 59 |
| Närhet & Intimitet | `#DD958B` (terracotta-pink) | `TILE_COLORS.sexualitetskort`, line 57 |
| Vårt Vi | `#94BCE1` (cobalt-light) | hardcoded on the Still Us tile, line 934 |

### What changes

Same composition recipe as before — 1024×1024 RGB PNG, no alpha, illustration centered at ~70% scale, subtle vignette, no text — only the canvas background changes to the library tile color. The illustration files stay the same (`src/assets/illustration-*.png`, plus `illustration-still-us-tile.png` for Vårt Vi to match what the library tile actually shows).

### Two small refinements while we're rerendering

1. **Vårt Vi**: switch source from `illustration-still-us.png` → `illustration-still-us-tile.png`. That's the asset the library tile uses, so the IAP icon will match the tile exactly.
2. **Vignette**: drop from 12% to 6% opacity. On these brighter pastel canvases, a heavier vignette muddies the color; a lighter one keeps the brand color pure while still adding subtle depth.

### Output

Overwrite the seven files in `/mnt/documents/app-store-iap/`:
- `jag-i-mig-1024.png` (now teal `#27A69C`)
- `jag-med-andra-1024.png` (now rose `#CB7AB2`)
- `jag-i-varlden-1024.png` (now chartreuse `#C6D423`)
- `vardag-1024.png` (now mint `#8BDDB0`)
- `syskon-1024.png` (now lilac `#CF8BDD`)
- `narhet-intimitet-1024.png` (now terracotta-pink `#DD958B`)
- `vart-vi-1024.png` (now cobalt-light `#94BCE1`, illustration swapped to tile asset)

Plus update `README.txt` with the new background hex per product.

### QA before delivery

For each PNG: verify (a) exact 1024×1024, (b) RGB no alpha, (c) hex of canvas pixel at `(50, 50)` matches the library tile color exactly, (d) illustration centered and not clipped, (e) downscale-test to 60×60 to confirm legibility in the App Store IAP list.

### Result

The seven IAP icons will visually match what users see on the library page — the same surface where they're already deciding to buy. Cohesive, on-brand, and honest to the in-app experience.

