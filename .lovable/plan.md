## Vårt Vi — remove background hero illustration

Single-file change to `src/components/AdultProductHome.tsx`.

### Change
Delete the `{product.heroImage && (...)}` block (lines 116–160) that renders the absolutely-positioned hero illustration and its backlight gradient behind the product home. Also remove the now-unused `useEffect` that prefetches `product.heroImage` (lines ~74–83).

### Kept
- Atmospheric cool glow (the cornflower radial gradient at top)
- Top scrim
- Title, tagline, NextActionBanner, filter chips, card grid

### Out of scope
- Manifest field `heroImage` itself (unused here, may still be referenced elsewhere — leave intact)
- Kids product home, palette, tile composition