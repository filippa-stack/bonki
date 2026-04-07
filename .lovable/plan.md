## Copy changes in `src/pages/KidsCardPortal.tsx`

### Change 1 — Remove question count from metadata (line 585)
Both free and non-free cards.

**Line 585:** `{promptCount} frågor · {estimateMinutes(promptCount, productSlug)}`
→ `{estimateMinutes(promptCount, productSlug)}`

### Change 2 — Non-free card counter (line 664)
**Line 664:** `Samtal {currentIndex + 1} av {categoryCards.length}`
→ `{currentIndex + 1} av {categoryCards.length} i {category.title}`

### Change 3 — Free card counter section (lines 691–703)
Remove the "Samtal 1 av {product.cards.length}" span entirely.

Replace with a new static line that renders **below** the "Starta samtal" button area (move it after the button block, around line 617). Actually, since lines 691–703 are already below the button, we keep it there but change the text:

→ `1 av {product.cards.length} samtal i {product.name}`

### Change 4 — Browse link text (line 728)
**Line 728:** `Utforska alla samtal`
→ Conditional:
- If `isFreeCard`: `Utforska {product.name}`
- Else: `Fler i {category.title}`

Product names confirmed in manifests:
- sexualitetskort → "Närhet & Intimitet" ✓
- still_us → "Vårt Vi" ✓
- All others match their display names ✓

### Files changed
Only `src/pages/KidsCardPortal.tsx` — 4 text edits, no logic/layout/routing changes.
