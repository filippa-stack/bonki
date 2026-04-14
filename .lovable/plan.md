

## Fix: "Prova Jag i Mig — Ert första samtal är gratis" shown after free card is already used

### Problem

After completing the free "Vänskap" card in Jag med Andra, the library shows a suggestion banner saying "Prova Jag i Mig — Ert första samtal är gratis". This is incorrect: the user's one free card (tied to their onboarding audience "middle" = Jag med Andra) has already been used. Jag i Mig is not free for this user.

The bug is in `ProductLibrary.tsx` lines 809-881. The "next step suggestion" banner always displays "Ert första samtal är gratis" as subtitle text, without checking whether the suggested product actually has a free card for this user.

### Fix

In `src/components/ProductLibrary.tsx`, update the suggestion banner (around line 865) to conditionally show the "gratis" subtitle only when `isProductFreeForUser(untriedProduct.id)` is true AND the free card for that product has not been completed.

When the product is NOT free for the user, show a neutral subtitle instead, e.g. "Utforska {count} samtal" or hide the subtitle entirely.

### Change detail

**File:** `src/components/ProductLibrary.tsx`

1. Around line 810, after resolving `untriedProduct`, compute whether it's actually free:
```typescript
const isUntriedFree = isProductFreeForUser(untriedProduct.id) 
  && untriedProduct.freeCardId 
  && !completedCardSets[untriedProduct.id]?.has(untriedProduct.freeCardId);
```

2. Line 865 — change the subtitle from hardcoded "Ert första samtal är gratis" to:
```typescript
{isUntriedFree ? 'Ert första samtal är gratis' : `${untriedProduct.cards.length} samtal`}
```

### Not touched
- `freeCardPolicy.ts` — logic is correct
- Free session banner (lines 748-800) — already has proper guards
- No other files

