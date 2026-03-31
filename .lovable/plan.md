

## Audit Result: Category.tsx and CardView.tsx Background Hook Placement

### Category.tsx — Correct, one minor edge case

The hook is called once at the top level (line 179-180) with a conditional value:
```ts
const pageBg = isStillUsCategory ? '#2E2233' : '#FAF7F2';
usePageBackground(pageBg);
```

This covers both real render paths:
- **Still Us branch** → root div uses `EMBER_NIGHT` (`#2E2233`) — matches hook
- **Fallback branch** → root div uses `'#FAF7F2'` — matches hook  
- **Kids branch** → `<Navigate>` redirect, no content rendered — no background needed

**Minor edge case:** The "category not found" early return (line 184) uses `isStillUsCategory ? 'var(--surface-base)' : MIDNIGHT_INK` — neither value matches what the hook sets. This is a rare error state; low severity but technically mismatched.

**Fix needed:** Change the not-found return's `backgroundColor` to use `pageBg` instead of its own expression, so it stays consistent. One-line change.

### CardView.tsx — Correct in practice, no fix needed

The hook (line 206):
```ts
usePageBackground(product?.backgroundColor ?? 'var(--surface-base)');
```

The main render root div (line 3066-3068):
```ts
style={{ backgroundColor: 'var(--surface-base)' }}
```

These look mismatched — the hook passes `product?.backgroundColor` directly while the root div uses `var(--surface-base)`. But `useProductTheme` (called at line 197) sets the `--surface-base` CSS variable to `product?.backgroundColor` when provided. So `var(--surface-base)` resolves to the same value. **No color seam.**

The loading state (line 990) uses `product?.backgroundColor ?? 'var(--surface-base, hsl(46, 64%, 89%))'` — the extra CSS fallback inside `var()` is harmless and resolves identically.

### Proposed change — 1 line in Category.tsx

In the "not found" early return (line 186), change:
```ts
backgroundColor: isStillUsCategory ? 'var(--surface-base)' : MIDNIGHT_INK
```
to:
```ts
backgroundColor: pageBg
```

This ensures the not-found state uses the same background the hook set, preventing any bleed in that edge case. No other files need changes.

