

## Fix: Filter orphaned card_ids from progress counts

**File:** `src/components/ProductLibrary.tsx`

**Root cause:** The database contains completed sessions with card_ids from old content structures that no longer exist in the product manifest. The Set counts all unique card_ids regardless, producing counts like "25 av 22".

### Change — Filter counts against manifest at the source (lines 535-537)

Replace the simple `.size` count with a filtered count using `allProducts`:

```tsx
for (const [productId, cardIds] of Object.entries(sets)) {
  const manifest = allProducts.find(p => p.id === productId);
  if (manifest) {
    counts[productId] = [...cardIds].filter(id => manifest.cards.some(c => c.id === id)).length;
  } else {
    counts[productId] = cardIds.size;
  }
}
```

This fixes it globally for all products (Still Us and kids products alike). No changes needed at the tile rendering level — `completedCountMap` will already contain the correct filtered count.

The `completedCardSets` state keeps the raw sets (needed for `freeCardId` checks which do match current manifest IDs).

### Not changed
- Tile rendering code (lines 896, 988)
- Data fetch queries
- `completedCardSets` (keeps all DB card_ids for badge logic)
- Any other file

