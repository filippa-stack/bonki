

## Show product name clearly on each Journal reflection

Currently each note card's metadata line (bottom of the card) shows:
```
cardName · categoryName · date
```

The user wants the **product** to be the most visible identifier. The new metadata layout:

```
Produkt                          datum
Kort/Samtal
```

### Changes in `src/pages/Journal.tsx`

**1. Add a `getProductName` helper** (next to existing `getCardTitle`/`getCategoryName`):
```typescript
function getProductName(productId: string, cardId?: string): string {
  if (cardId) {
    const prod = allProducts.find(p => p.cards.some(c => c.id === cardId));
    if (prod) return prod.name;
  }
  const prod = allProducts.find(p => p.id === productId);
  return prod?.name ?? '';
}
```

**2. Update the metadata section in `NoteEntryCard`** (lines 296-311):

Replace the current single-line `cardName · categoryName · date` with a two-line layout:
- **Line 1**: Product name (left, slightly brighter) + date (right-aligned)
- **Line 2**: Card/conversation name (smaller, muted)

```
┌─────────────────────────────────┐
│ Jag med andra          idag    │
│ Utanför                         │
└─────────────────────────────────┘
```

The product name uses the product's accent color at reduced opacity for subtle brand identity. The card name stays in the current muted style.

**3. Update `CompletedMarkerRow`** — add product name before card name so empty-session rows also show which product they belong to.

### No other files changed
- Data layer, hooks, types — untouched
- Filter chips, pulse card, bookmarks section — untouched

