

## Fix: Cream flash from `#root` background

**File:** `src/index.css`, line ~259

Inside `@layer base`, the `#root` rule uses `var(--surface-base, #0B1026)` which resolves to cream once CSS variables load.

**Change:**
```css
/* Line ~259, inside @layer base #root */
background-color: var(--surface-base, #0B1026);
→
background-color: var(--page-bg, #0B1026);
```

One variable swap. Nothing else touched.

