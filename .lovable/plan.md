

## Make LibraryResumeCard always use product tile color

### Change
In `src/components/LibraryResumeCard.tsx`, remove the conditional that only applies product color when `global` is true. Always use the product's tile color from `PRODUCT_TILE_COLORS` as `tileBg`.

**Before (~line 183):**
```js
const useProductBg = !!global;
const tileBg = useProductBg
  ? (PRODUCT_TILE_COLORS[display.productId] ?? DEEP_DUSK)
  : DEEP_DUSK;
```

**After:**
```js
const tileBg = PRODUCT_TILE_COLORS[display.productId] ?? DEEP_DUSK;
```

This single change makes the banner visibly tinted with the paused product's color in all contexts, matching the already-working global variant.

