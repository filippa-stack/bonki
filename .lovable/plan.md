## Goal

Shrink the faint "ghost glow" Bonki logo (the large watermark behind the page content) to one-third of its current size on every page that shows it.

## Where it lives

The watermark is rendered by `src/components/BackgroundWatermark.tsx` in `heroAlt` mode (the default). It currently displays at:

- `width: 96vw`
- `maxWidth: 600px`

It is shown on all routes **except** `/`, `/card/*`, `/product/*`, `/diary`, and when `?devState=library`. So it appears on pages like the kids product home, archive, journal entry views, etc.

## Change

In `src/components/BackgroundWatermark.tsx`, inside the `heroAlt` branch, divide the logo dimensions by 3:

- `width: 96vw` → `width: 32vw`
- `maxWidth: 600px` → `maxWidth: 200px`

The opacity (0.04), positioning (top of viewport, centered), saturation filter, and the gradient/clip-path mask all stay exactly as they are. Only the size changes.

## Notes

- The `heroAlt` block is marked as a "LOCKED DESIGN" in a comment (approved 2026-02-26). You're explicitly overriding that lock with this request — I'll update the comment to reflect the new approved size.
- The other watermark modes (`full`, `behind`, `hero`) are not used by default, so I'll leave them untouched. If you want those shrunk too, say so and I'll match them.
- No other logo instances are affected (header wordmark, footer, loader, error boundary, 404, login, install, diary, onboarding, category-card tile mode all stay as-is).

## Files touched

- `src/components/BackgroundWatermark.tsx` — two numeric values + comment update.
