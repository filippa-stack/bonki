## Add press state to product card tiles

### Verification

`src/components/ProductCardTile.tsx` card root is a plain `<button>` with `onClick={() => navigate(\`/card/\${card.id}\`)}`. No `:active`, no scale-down, no opacity dip. Inline style currently has `cursor: 'pointer'` and `transition: 'box-shadow 0.3s ease, transform 0.3s ease'`. No `WebkitTapHighlightColor` set. Not a `motion.div` — no framer-motion conflict on the root. (Pill inside is a `motion.div` for completion fade only — unaffected.)

### Fix

1. **`src/index.css`** — append:

   ```css
   .product-card-tile {
     transform: translateZ(0);
     transition: transform 120ms ease, filter 120ms ease, box-shadow 0.3s ease;
     -webkit-tap-highlight-color: transparent;
     cursor: pointer;
   }
   .product-card-tile:active {
     transform: scale(0.97);
     filter: brightness(0.92);
   }
   @media (prefers-reduced-motion: reduce) {
     .product-card-tile:active { transform: none; }
   }
   ```

   (Box-shadow kept in transition list to preserve current 0.3s shadow easing.)

2. **`src/components/ProductCardTile.tsx`** — on the root `<button>`:
   - Add `className="product-card-tile"`.
   - Remove inline `cursor: 'pointer'` (now in class).
   - Remove inline `transition: 'box-shadow 0.3s ease, transform 0.3s ease'` (now in class — the previous transform 0.3s would conflict with the 120ms press easing).
   - Keep all other inline styles (position, overflow, aspectRatio, borderRadius, textAlign, backgroundColor, border, boxShadow, padding) and all child elements untouched.

### Preserved

Illustration, scrim, title, completion checkmark + its motion fade, aspect ratio, routing, `useCardImage`, ARIA, chip press state.

### Files

- `src/index.css` — append `.product-card-tile` rule
- `src/components/ProductCardTile.tsx` — add className, drop inline cursor + transition
