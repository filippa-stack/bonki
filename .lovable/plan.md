

## Fix: Status Bar Background Mismatch on Product Home Pages

### Root Cause

`ProductHome.tsx` line 20 calls `usePageBackground('var(--surface-base)')` — this sets `--page-bg` to the literal string `var(--surface-base)`, which resolves to the light-theme default. The child component (`KidsProductHome`) renders its own background div with the product's dark color, but never updates `--page-bg`. The `#root` element background (visible behind the iOS status bar) stays light/default.

### Fix — single file: `src/pages/ProductHome.tsx`

**Line 20**: Change `usePageBackground` to use the product's actual background color instead of `var(--surface-base)`.

```typescript
// Before
usePageBackground('var(--surface-base)');

// After
usePageBackground(product?.backgroundColor ?? 'var(--surface-base)');
```

This ensures that when a product has a dark background (e.g. `#721B3A` for Jag med Andra), the `--page-bg` CSS variable matches, and the `#root` background bleeds correctly into the status bar area.

One line change. No structural or behavioral changes.

