

## Prompt 5: Wire free card policy into remaining surfaces

Three files, import + minimal logic changes each.

### 1. `src/components/CompletedSessionView.tsx`
- **Add import** (after line 8): `import { isProductFreeForUser } from '@/lib/freeCardPolicy';`
- **Line 70**: Change `const isFreeCard = product?.freeCardId === cardId;` → `const isFreeCard = product?.freeCardId === cardId && isProductFreeForUser(product?.id ?? '');`

### 2. `src/pages/Category.tsx`
- **Add import** (after line 20 area): `import { isProductFreeForUser } from '@/lib/freeCardPolicy';`
- **Line 240** (FreeCardBadge condition): Add `&& isProductFreeForUser(product.id)`:
  ```tsx
  {product?.freeCardId === card.id && !allTimeCompletedCardIds.includes(card.id) && isProductFreeForUser(product.id) && (
    <FreeCardBadge />
  )}
  ```
- **Line 245** (paywall intercept): Add `&& isProductFreeForUser(product.id)` to the free-card bypass:
  ```tsx
  if (product && !(card.id === product.freeCardId && isProductFreeForUser(product.id)) && !productIsPurchased) {
  ```
- **Lines 269-279** (PaywallBottomSheet props): Compute eligibility and pass conditionally:
  ```tsx
  const freeEligible = isProductFreeForUser(product.id);
  ...
  freeCardCompleted={freeEligible ? (product.freeCardId ? completedCardIds.includes(product.freeCardId) : true) : true}
  onNavigateToFreeCard={freeEligible && product.freeCardId ? () => { ... } : undefined}
  ```

### 3. `src/pages/ProductHome.tsx`
- **Add import** (line 12 area): `import { isProductFreeForUser } from '@/lib/freeCardPolicy';`
- **Line 81-93** (onStartFreeCard handler): Wrap navigation in eligibility check:
  ```tsx
  onStartFreeCard={() => {
    if (product.id) localStorage.setItem(`bonki-intro-seen-${product.id}`, '1');
    setShowIntro(false);
    if (product.freeCardId && isProductFreeForUser(product.id)) {
      // existing navigation logic
    }
  }}
  ```
  When not eligible, the handler just dismisses the intro (no free card navigation).

No other files or logic changes.

