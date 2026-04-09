

## Journal cards — product home backgrounds (solid, no gradient)

### Summary
Replace the current gradient card backgrounds with solid product `backgroundColor` values. Switch metadata text from Lantern Glow to product `accent.light`. Drop the gradient since all product backgrounds are already dark and rich.

### Changes in `src/pages/Journal.tsx`

**`getProductAccent`** — Add `bg` field from the product manifest's `backgroundColor`:

```ts
function getProductAccent(productId: string, cardId?: string): { light: string; mid: string; deep: string; bg: string } {
  // ... existing product resolution ...
  const product = allProducts.find(p => p.id === effectiveProduct);
  const colors = productTileColors[paletteKey];
  return colors && product
    ? { light: colors.tileLight, mid: colors.tileMid, deep: colors.tileDeep, bg: product.backgroundColor }
    : { light: LANTERN_GLOW, mid: MIDNIGHT_INK, deep: MIDNIGHT_INK, bg: MIDNIGHT_INK };
}
```

**`NoteEntryCard` + `SessionGroupCard` — style updates:**

| Element | Current | New |
|---|---|---|
| Card background | `linear-gradient(135deg, ${accent.mid}, ${accent.deep}cc)` | `accent.bg` (solid) |
| Left stripe | `accent.light` | Keep |
| Box shadow | `0 2px 12px rgba(0,0,0,0.25), 0 0 0 0.5px ${accent.deep}33` | `0 2px 12px rgba(0,0,0,0.25)` (simplified) |
| Product name | `LANTERN_GLOW` | `accent.light` |
| Card name | `${LANTERN_GLOW}88` | `${accent.light}aa` |
| Date | `${LANTERN_GLOW}66` | `${accent.light}77` |
| Question text `—` | `${LANTERN_GLOW}73` | `${accent.light}88` |
| Reflection text | `LANTERN_GLOW` | `LANTERN_GLOW` (unchanged) |
| "Läs mer" / "Visa alla" | `${LANTERN_GLOW}60` | `${accent.light}77` |
| Takeaway label | `${LANTERN_GLOW}55` | `${accent.light}66` |
| Takeaway block bg | `rgba(0,0,0,0.15)` | Keep |

### Files changed
- `src/pages/Journal.tsx` — `getProductAccent` return type + inline styles in two card components

### What stays untouched
- All data fetching, queries, filters, timeline logic, protected refs
- Spine, month markers, pulse card, bookmarks, CompletedMarkerRow

