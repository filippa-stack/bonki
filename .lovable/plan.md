## Bug fix: restore portal entry for product card tiles

The recent change made `ProductCardTile` navigate directly to `/card/:cardId`, bypassing the portal page. This causes lost reflections (save pipeline lives in the portal mount sequence) and broken resume-from-pause.

### Change

**`src/components/ProductCardTile.tsx`**
- Add `productSlug: string` to `ProductCardTileProps`.
- Replace `onClick={() => navigate(`/card/${card.id}`)}` with:
  `onClick={() => navigate(`/product/${productSlug}/portal/${card.categoryId}?card=${card.id}`)}`
  This matches the existing portal route (`/product/:productSlug/portal/:categoryId`) and the `?card=` pattern already used by `KidsCardPortal`, `NextConversationCard`, and `NextActionBanner`.

**`src/components/KidsProductHome.tsx`** (line ~729)
- Pass `productSlug={product.slug}` to `<ProductCardTile />`.

No other files change. Press state, styling, completion checkmark, and all other behavior remain identical.

### Verification

Test paths A–D from the bug report (fresh tile, paused-resume tile, resume banner, "Nästa samtal") on the kids product home.
