

## Fix: Free card exit → product home

**File:** `src/pages/CardView.tsx` — line 2652

### Change

Add `isFreeCard` check (already defined at line 199) so free card exit routes to product home instead of category portal.

**Lines 2652–2655 — replace with:**

```typescript
  const exitBackTo = isFromArchive ? '/shared' : (
    isFreeCard && product ? `/product/${product.slug}` :
    product && category ? `/product/${product.slug}/portal/${category.id}` :
    product ? `/product/${product.slug}` : '/'
  );
```

Nothing else changes.

