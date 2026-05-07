# Kids tile variant assignment — adjacency fix

## Problem

`getInteriorForCard` in `src/lib/productTileVariants.ts` currently picks an interior variant by hashing `cardId` and indexing into a short permutation table. Because hashes collide arbitrarily, adjacent cards in the 2-col grid often land on the same variant, producing visible clustering on JIM, JmA, JIV, and Vardag.

## Fix

Replace the hash-based lookup with a **position-based** lookup that uses hand-tuned per-product permutations long enough to cover each product's full card list, designed to avoid 2-col adjacency repeats.

## Changes

### 1. `src/lib/productTileVariants.ts`

Update each product's `permutation` to the full-length, adjacency-aware sequences from the prompt:

- `jag_i_mig` (4 variants, 21 cards): `[0,2,1,3,2,0,3,1,0,2,1,3,2,0,3,1,0,2,1,3,2]`
- `jag_med_andra` (3 variants, 21 cards): `[0,2,1,0,2,1,0,2,1,0,2,1,0,2,1,0,2,1,0,2,1]`
- `jag_i_varlden` (3 variants, 20 cards): `[0,2,1,0,2,1,0,2,1,0,2,1,0,2,1,0,2,1,0,2]`
- `vardagskort` (4 variants, 15 cards): `[0,2,1,3,2,0,3,1,0,2,1,3,2,0,3]`
- `syskonkort` (5 variants, 13 cards): `[0,3,1,4,2,0,3,1,4,2,0,3,1]`
- `sexualitetskort` (4 variants, 14 cards): `[0,2,1,3,2,0,3,1,0,2,1,3,2,0]`

Replace `getInteriorForCard(productId, cardId, fallback)` with `getInteriorForCard(productId, positionIndex, fallback)`:

```ts
export function getInteriorForCard(productId, positionIndex, fallback) {
  const entry = interiorVariants[productId];
  if (!entry) return fallback;
  const idx = entry.permutation[positionIndex % entry.permutation.length];
  return entry.variants[idx] ?? fallback;
}
```

Drop the `hashCardId` helper (no longer needed). Keep `getCalmInterior` unchanged.

Add an inline self-check (dev-only, runs once at module load) that asserts for each product:
- `permutation[i] !== permutation[i+1]` for all `i` (horizontal adjacency)
- For 4+ variant products: `permutation[i] !== permutation[i+2]` (vertical adjacency)
- For 3-variant products (JmA, JIV): only the horizontal check is required

If a check fails, `console.warn` once with the offending product/index — no throw.

### 2. `src/components/ProductCardTile.tsx`

Add a required `positionIndex: number` prop and pass it to `getInteriorForCard` instead of `card.id`.

### 3. `src/components/KidsProductHome.tsx`

Pass `positionIndex={index}` from the existing `product.cards.map((card, index) => ...)` callsite (line 736).

## What does NOT change

- Variant hex values, frame colors, `KidsTileFrame`, library/portal/session/completion code paths (they use `getCalmInterior`).
- Card ordering in product manifests (positions are already stable).
- Same card always renders the same variant because positions are stable in the data.

## Verification

After implementation, on iPhone 15 (390×844), screenshot each kids product home (JIM, JmA, JIV, Vardag, Syskon, N&I) and visually confirm:
- No horizontally adjacent cards share a variant in any product.
- For 4+ variant products, no vertically adjacent cards share a variant either.
- Reload twice — same card → same variant.
