

## Fix: useKidsProductProgress — query by card_id membership instead of product_id

### Problem
Sessions may have stale `product_id: 'still_us'` due to the old RPC overload bug. Filtering by `product_id` misses sessions that actually belong to the product.

### Change in `src/hooks/useKidsProductProgress.ts`

**1. Update `fetchFromDb` guard and queries (lines 77–97)**

- Compute `productCardIds = product.cards.map(c => c.id)` at the top of the callback
- Guard: change `if (!space?.id || !productId) return;` → `if (!space?.id || !product) return;`
- Line 87: replace `.eq('product_id', productId)` → `.in('card_id', productCardIds)`
- Line 95: replace `.eq('product_id', productId)` → `.in('card_id', productCardIds)`

**2. Update dependency array (line 142)**

- Change `[space?.id, productId]` → `[space?.id, product]`
- Since `product` is a manifest object that's stable per-product, this won't cause extra re-renders

**3. Realtime subscription guard (around line 185)**

- Update guard from `if (isLocalPreview || !space?.id || !productId) return;` → `if (isLocalPreview || !space?.id || !product) return;`
- The channel name can keep using `productId` (cosmetic only)

No changes to expiry logic, next-card sequencing, demo mode, or realtime event handling.

### Files changed
- `src/hooks/useKidsProductProgress.ts` only

