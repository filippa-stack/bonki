

## Prompt 2: Apply free card policy to paywall gates

Two one-line changes plus imports.

### File 1: `src/pages/CardView.tsx`
- Add import: `import { isProductFreeForUser } from '@/lib/freeCardPolicy';`
- Line 199: Change `const isFreeCard = !!(product?.freeCardId && cardId === product.freeCardId);` → `const isFreeCard = !!(product?.freeCardId && cardId === product.freeCardId && isProductFreeForUser(product.id));`

### File 2: `src/pages/KidsCardPortal.tsx`
- Add import: `import { isProductFreeForUser } from '@/lib/freeCardPolicy';`
- Line 310: Change `const isFreeCard = card.id === product.freeCardId;` → `const isFreeCard = card.id === product.freeCardId && isProductFreeForUser(product.id);`

No other logic changes in either file.

