

## Prompt 4: Update ProductIntro copy for free card eligibility

### Changes (single file: `src/components/ProductIntro.tsx`)

**1. Add import (line 9 area)**
```typescript
import { isProductFreeForUser } from '@/lib/freeCardPolicy';
```

**2. Add `hasFreeCard` variable (after line 110)**
```typescript
const hasFreeCard = isProductFreeForUser(productId);
```

**3. Update CTA label logic (lines 164-169)**
Replace:
```typescript
const ctaLabel = isStillUs
  ? STILL_US_CTA
  : resolvedFreeCardTitle
    ? `Börja med ${resolvedFreeCardTitle}`
    : introData.ctaLabel;
```
With:
```typescript
const ctaLabel = hasFreeCard
  ? (isStillUs ? STILL_US_CTA : resolvedFreeCardTitle ? `Börja med ${resolvedFreeCardTitle}` : introData.ctaLabel)
  : introData.ctaLabel;
```

**4. Conditionally render "gratis" reassurance text**
Wrap the "Ert första samtal är gratis" paragraph so it only renders when `hasFreeCard` is true:
```tsx
{hasFreeCard && (
  <p style={...}>
    Ert första samtal är gratis — ingen betalning krävs.
  </p>
)}
```

No other changes. All protected patterns, paywall logic, session handling, and product data remain untouched.

