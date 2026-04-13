

## Add `showFreeBanner` derived variable to ProductLibrary

**Single file**: `src/components/ProductLibrary.tsx`

### Change

After the `sortedKidsProducts` useMemo block (line 584), insert this additive block:

```typescript
// Derived: should we show the free-session banner?
const freeProduct = allProducts.find(p => isProductFreeForUser(p.id));
const freeCardUsed = freeProduct?.freeCardId
  ? (completedCardSets[freeProduct.id]?.has(freeProduct.freeCardId) ?? false)
  : false;
const freeProductPurchased = freeProduct ? purchased.has(freeProduct.id) : false;
const showFreeBanner = !!freeProduct && !freeCardUsed && !freeProductPurchased;
```

All referenced variables (`allProducts`, `isProductFreeForUser`, `completedCardSets`, `purchased`) are already in scope. No imports or other changes needed.

This is Change 1 of 4 — ready to implement now, awaiting the remaining 3 changes.

