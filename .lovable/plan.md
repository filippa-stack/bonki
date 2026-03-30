

## Fix: Eliminate font-swap reflow causing tile/text layout shifts

### Problem
1. **Duplicate font loading**: Cormorant and DM Sans are loaded twice — once via `<link>` in `index.html` (line 22) and again via `@import` in `src/index.css` (line 19). The CSS `@import` is render-blocking and redundant.
2. **`display=swap`** causes FOUT (Flash of Unstyled Text): browser renders with Georgia/system fallback, then swaps to the web font, reflowing every text element. This shifts tile text blocks, changes line heights, and causes the "everything jiggles" effect on load.
3. **`fontVariationSettings: 'opsz' 24`** on tiles makes the swap delta worse — optical size adjustments change glyph widths significantly vs. the fallback.

### Changes

**File 1: `src/index.css`** — Remove the duplicate `@import` on line 19.

```text
REMOVE:
@import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400;1,9..40,500&display=swap');
```

This removes the render-blocking CSS import. The `<link>` in `index.html` already loads these fonts and does so non-blocking.

**File 2: `index.html`** — Change `display=swap` to `display=optional` on the Google Fonts `<link>`.

```text
BEFORE:
&display=swap

AFTER:
&display=optional
```

With `display=optional`, the browser uses the web font only if it's already cached or loads within ~100ms. No visible swap, no reflow. On repeat visits (which is the primary use case for this app), the font is cached and always used. On first-ever visit with slow connection, users see Georgia (the fallback) — which is acceptable and visually similar to Cormorant.

### What this fixes
- Eliminates the visible text reflow on every page load
- Removes a render-blocking CSS `@import` (faster first paint)
- Tile text blocks no longer shift after initial render
- No changes to any component, hook, or protected file

### Scope
- `src/index.css` — remove line 19
- `index.html` — change `swap` → `optional` on line 22

No other files modified.

