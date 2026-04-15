

## Prompt 5 — Remove Remaining Free-Card UI and Paywall Bypasses

Four files, exact changes as specified.

---

### Change 1: `src/pages/CardView.tsx`
- **Remove import** `isProductFreeForUser` (line 7)
- **Line 200** — change to `const isFreeCard = false;`

### Change 2: `src/pages/Category.tsx`
- **Remove import** `isProductFreeForUser` (line 25)
- **Lines 241–243** — delete GRATIS badge block
- **Line 246** — simplify paywall check to `if (product && !productIsPurchased)`
- **Line 712** — simplify paywall check to `if (product && !productIsPurchased)`
- **Lines 744–746** — delete second GRATIS badge block

### Change 3: `src/components/ProductLibrary.tsx`
- **Remove import** `isProductFreeForUser` (line 14)
- **Lines 594–599** — delete all six free banner variables
- **Lines 748–800** — delete entire free banner JSX block
- **Line 1121–1122** — change to `const suShowFreeLabel = false;`
- **Lines 1223–1224** — change to `const showFreeLabel = false;`

### Change 4: `src/components/PaywallBottomSheet.tsx`
- **Lines 301–323** — delete the "Prova ett gratis samtal först" button block

### Files Modified
- `src/pages/CardView.tsx`
- `src/pages/Category.tsx`
- `src/components/ProductLibrary.tsx`
- `src/components/PaywallBottomSheet.tsx`

### Not Changed
- CardView.tsx session/reflection logic, hooks, refs, effects
- Index.tsx, ProductHome.tsx, KidsCardPortal.tsx, ProductIntro.tsx, BuyPage.tsx
- freeCardPolicy.ts (left as inert file)

