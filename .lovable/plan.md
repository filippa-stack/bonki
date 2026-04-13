

## Fix: Free card CTA shows "Lås upp" for ineligible users

**File**: `src/pages/KidsCardPortal.tsx` (line 621)

Replace `card.id !== product.freeCardId` with `!isFreeCard` (which is already defined at line 311 and includes the `isProductFreeForUser()` check).

```typescript
// From:
const isLocked = product && card.id !== product.freeCardId && !productIsPurchased && !bypassPaywall;
// To:
const isLocked = product && !isFreeCard && !productIsPurchased && !bypassPaywall;
```

No other changes.

