## Goal

On `/product-home-mock/:productId`, give each card tile its product accent color (matching the library tiles) instead of the shared `DEEP_DUSK` background.

## Change

In `src/components/ProductHomeMock.tsx`, card tile button (line ~339):

- Replace `background: DEEP_DUSK` with `background: meta.progressColor` — the per-product accent already defined in `MOCK_META` (e.g. `#5BC9BC` for jag_i_mig, `#E27BAC` for jag_med_andra, etc.).

Everything else on the tile stays as-is: 1:1.05 aspect, illustration centered, title bottom-left with text-shadow, progress bar at bottom. The resume banner above the grid keeps `DEEP_DUSK` (matches library resume banner pattern).
