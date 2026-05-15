## Goal

Deliver 7 downloadable PNGs — one per library tile, exactly as they appear in the app today, with transparent background outside the tile's rounded shape.

## Tiles to capture

1. **Vårt Vi** (Still Us) — horizontal marquee, cobalt blue, 14 px radius
2. **Jag i mig** — grid tile (orange)
3. **Jag med andra** — grid tile (pink)
4. **Vardag** — grid tile (mint)
5. **Syskon** — grid tile (lilac)
6. **Jag i världen** — grid tile (lime)
7. **Sexualitet** — grid tile (terracotta)

All grid tiles use `borderRadius: 14`, the marquee uses `borderRadius: 14`. Each `<button>` already has a unique `aria-label` (product name) plus `Vårt Vi` for the marquee — easy to target.

## Approach

```text
1. Navigate browser to "/" at 390 × 844 (the user's mobile viewport).
2. Use browser--act to scroll the library so all tiles are in view,
   then read each target button's getBoundingClientRect via observe/eval.
3. Take a full-page screenshot at devicePixelRatio = 2 (so output is ~1560 px wide).
4. In a Python script (PIL):
     - For each tile: crop the rectangle (scaled by DPR).
     - Build a rounded-rectangle alpha mask (radius 14 × DPR = 28 px).
     - Apply mask → corners become transparent, tile interior preserved.
     - Save to /mnt/documents/library-tile-{slug}.png
5. Emit one <presentation-artifact> tag per PNG.
```

## Auth / data caveat

The library route requires a signed-in user. If the live preview session is not authenticated, the page redirects to login and tiles won't render. Fallback plan:

- First try navigating to `/` directly. If the library renders, proceed.
- If it redirects to login, navigate to `/?devState=browse` (your project-knowledge dev state that unlocks all content for review). If that still gates, fall back to `/library-mock` which renders the same tile components without auth.

I'll confirm which one actually shows the tiles before cropping.

## Output

Seven files in `/mnt/documents/`:

```text
library-tile-vart-vi.png       (wide, ~1560×~600 px)
library-tile-jag-i-mig.png     (~750×~1000 px)
library-tile-jag-med-andra.png
library-tile-vardag.png
library-tile-syskon.png
library-tile-jag-i-varlden.png
library-tile-sexualitet.png
```

Each PNG: tile artwork exactly as rendered (illustration + title strip + meta row), rounded corners alpha-masked to transparent. No surrounding Midnight Ink background.

## Not in scope

- No code changes to the library.
- No re-rendering tiles at a different size (you chose "cropped from live library screenshot").
- No alteration of badges, completion counts, or metadata — they appear as they currently show for the live session (likely "X SAMTAL · ÅLDER" for unpurchased state).
