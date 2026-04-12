

## Prompt 1: Utility function + stop deleting audience key

### Changes

**1. Create `src/lib/freeCardPolicy.ts`**
```typescript
const AUDIENCE_PRODUCT_MAP: Record<string, string> = {
  young: 'jag_i_mig',
  middle: 'jag_med_andra',
  teen: 'jag_i_varlden',
  couple: 'still_us',
};

export function isProductFreeForUser(productId: string): boolean {
  const audience = localStorage.getItem('bonki-onboarding-audience');
  if (!audience) return true;
  return AUDIENCE_PRODUCT_MAP[audience] === productId;
}
```

**2. Edit `src/pages/Index.tsx`**
Remove line 156 (`localStorage.removeItem('bonki-onboarding-audience');`) so the audience key persists permanently after onboarding.

