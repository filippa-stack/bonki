## Goal

Route purchased-state Vårt Vi preview tile taps to the rich `AdultCardPortal` page instead of jumping straight to `CardView`. Resume banner, locked tiles, and in-product flow stay untouched.

## Change (single file)

**`src/components/ProductLibrary.tsx`**

`allProducts` is already imported (line 11), so no new import is needed.

1. Add a small helper inside the default-exported component (near the existing product lookups around lines 810–815) that maps a `su-mock-N` card id to its `categoryId` via the `still_us` manifest:

   ```ts
   const resolveStillUsCategoryId = (cardId: string): string | null => {
     const stillUs = allProducts.find(p => p.id === 'still_us');
     const card = stillUs?.cards.find(c => c.id === cardId);
     return card?.categoryId ?? null;
   };
   ```

2. Replace the `onPurchasedTileTap` prop at line 901:

   ```tsx
   onPurchasedTileTap={(cardId) => {
     const categoryId = resolveStillUsCategoryId(cardId);
     if (categoryId) {
       navigate(`/product/still-us/portal/${categoryId}?card=${cardId}`);
     } else {
       navigate(`/card/${cardId}`);
     }
   }}
   ```

No other lines change.

## Explicitly not touched

- `AdultCardPortal.tsx`, `CardView.tsx`, `LibraryResumeCard.tsx`
- `VartViPreviewStrip` internals (still receives the same prop signature)
- Locked-state preview tiles, `CARD_SEQUENCE`, all hooks, data fetching, routing config
- Back-arrow behavior in `AdultCardPortal` (parked)

## Verification

1. Vi tab → tap never-started preview tile → lands on `AdultCardPortal` (eyebrow, title, illustration, "Starta samtal").
2. Portal → "Starta samtal" → Q1, no threshold (existing `fromPortal: true` at AdultCardPortal:177).
3. Portal → back arrow → `/product/still-us` (current portal behavior; parked).
4. Tap completed/revisit tile (saffron check) → portal renders with "Gör om samtalet".
5. Resume banner for paused card → unchanged: `/card/:id` with `resumed: true`, mounts at paused step.
6. In-product flow (product home → card → portal → start) → unchanged.
