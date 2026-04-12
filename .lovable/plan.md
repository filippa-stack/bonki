

## Add free card eligibility check to FreeCardBadge in KidsCardPortal

### Change
**`src/pages/KidsCardPortal.tsx`** — Line 516

Add `isProductFreeForUser(product.id)` to the existing conditional (import already present from Prompt 2):

```tsx
{product?.freeCardId === card.id && !allTimeSet.has(card.id) && isProductFreeForUser(product.id) && (
  <FreeCardBadge />
)}
```

Single-line change only. No other modifications.

