

## Copy changes in `src/pages/KidsCardPortal.tsx`

### Change 1 — Remove question count from metadata (line 585)
Both free and non-free cards.

`{promptCount} frågor · {estimateMinutes(promptCount, productSlug)}`
→ `{estimateMinutes(promptCount, productSlug)}`

### Change 2 — Non-free card counter (line 664)
`Samtal {currentIndex + 1} av {categoryCards.length}`
→ `{currentIndex + 1} av {categoryCards.length} i {category.title}`

### Change 3 — Free card counter (lines 691–703)
Replace `Samtal 1 av {product.cards.length}` with:
`1 av {product.cards.length} samtal i {product.name}`

### Change 4 — Browse link text (line 728)
`Utforska alla samtal` → conditional:
- Free card: `Utforska {product.name}`
- Non-free: `Fler i {category.title}`

Product names verified: sexualitetskort → "Närhet & Intimitet", still_us → "Vårt Vi".

### Files changed
Only `src/pages/KidsCardPortal.tsx` — 4 text-only edits.

