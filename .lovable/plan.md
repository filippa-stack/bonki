# Library cleanup batch (approved scope)

## 1. Delete dead `isUntriedFree` branch

**File:** `src/components/ProductLibrary.tsx`

- Line 506: remove `const isUntriedFree = false;`
- Line 560: replace `{isUntriedFree ? 'Ert första samtal är gratis' : `${untriedProduct.cards.length} samtal`}` with `` {`${untriedProduct.cards.length} samtal`} ``

Nudge behavior unchanged. "Återvänd till {produkt}" left untouched.

## 2. freeCardCtaLabel fixes

**File:** `src/data/productIntros.ts`

- `still_us.freeCardCtaLabel`: `"Börja med Ert första samtal"` → `"Börja med Vår uppväxt"`
- `jag_i_varlden.freeCardCtaLabel`: `"Börja med Identitet"` → `"Börja med Fördomar"` (manifest stays `freeCardId: 'jiv-fordomar'`)

Other products confirmed in sync — no changes.

## Out of scope
- Larger library redesign (separate prompt)
