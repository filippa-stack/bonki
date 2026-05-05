## Add press state to filter chips (mobile tactile feedback)

### Verification

I checked `src/components/CategoryFilterChips.tsx` (lines 100–122). The chip `<button>` has `WebkitTapHighlightColor: 'transparent'` (suppresses the default mobile tap flash) but **no `:active` styling** — so on touch the chip gives zero tactile feedback. Inline styles cannot express `:active`, so the fix needs a CSS class.

### Fix

1. **`src/index.css`** — Append a `.category-filter-chip` rule with a 120ms press-down (`transform: scale(0.96); filter: brightness(1.15);`) on `:active`. Respect `prefers-reduced-motion` (no transform, brightness only).

   ```css
   .category-filter-chip {
     transform: translateZ(0);
     transition: background 120ms ease, border-color 120ms ease,
                 transform 120ms ease, filter 120ms ease;
   }
   .category-filter-chip:active {
     transform: scale(0.96);
     filter: brightness(1.15);
   }
   @media (prefers-reduced-motion: reduce) {
     .category-filter-chip:active { transform: none; }
   }
   ```

2. **`src/components/CategoryFilterChips.tsx`** — Add `className="category-filter-chip"` to the chip `<button>`. Remove the inline `transition` (now in CSS) to avoid duplication. Keep all other inline styles (background, border, padding, color, `WebkitTapHighlightColor`).

### Preserved

Selection states, color-mix backgrounds/borders, `aria-pressed`, ARIA group/live region, mask fade, padding, font, all behavior. No new color tokens.

### Files

- `src/index.css` — append chip press-state rule
- `src/components/CategoryFilterChips.tsx` — add className, drop duplicate inline transition
