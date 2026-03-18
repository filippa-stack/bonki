

## Prompt 1.1 — Global CSS: Focus Rings, Reduced Motion, DM Serif Display

### What exists today
- `src/index.css` (798 lines): Global styles with `:root` tokens, type scale, CTA styles. No focus-visible rules, no reduced-motion query.
- `src/styles/themes.css` (729 lines): Theme overrides. Not touched.
- DM Serif Display is only used in a static HTML preview file (`public/library-mood-comparison.html`), not imported in the app's CSS or `index.html`.
- Google Fonts import on line 10 of `index.css` loads Fraunces + Nunito only.

### Changes

**File: `src/index.css`** — append-only, no existing rules modified.

1. **Google Fonts import** (line 10): Extend the existing `@import url(...)` to also include `DM+Serif+Display:ital,wght@0,400;1,400`.

2. **Focus ring styles** — add after the `@layer base` block (after line 253):
   ```css
   /* ── Accessibility: focus rings ── */
   :focus-visible {
     outline: 2px solid #E8913A;
     outline-offset: 2px;
   }
   :focus:not(:focus-visible) {
     outline: none;
   }
   ```

3. **Reduced motion** — add at end of file:
   ```css
   /* ── Accessibility: reduced motion ── */
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       transition-duration: 0.01ms !important;
     }
   }
   ```

### Files NOT touched
- `src/lib/palette.ts`
- `src/styles/themes.css`
- `tailwind.config.ts`
- No Still Us color variables added to `:root`

### Risk
Zero — all additions are new rules that don't override existing selectors. The focus ring color `#E8913A` (Saffron-adjacent) fits the warm palette. DM Serif Display import is additive.

