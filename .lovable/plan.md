

## Free card portal — show full product scope

**File:** `src/pages/KidsCardPortal.tsx` only

### Approach

Add a boolean `isFreeCard = card?.id === product?.freeCardId` computed once. Then use it in three places:

### Changes

1. **Counter text (line ~661)**
   - When `isFreeCard`: show `Samtal 1 av {product.cards.length}` (total product cards)
   - Otherwise: keep existing `Samtal {currentIndex + 1} av {categoryCards.length}`

2. **Hide arrows when `isFreeCard` (lines ~629–684)**
   - Wrap the two arrow buttons in a condition: only render when `!isFreeCard`
   - Also disable swipe drag: change `drag={portalPhase === 'idle' ? 'x' : false}` to also require `!isFreeCard`

3. **"Utforska alla samtal" button (lines ~687–703)**
   - When `isFreeCard`: navigate directly to `/product/${product.slug}` instead of opening `PortalBrowseSheet`
   - Otherwise: keep current `setBrowseOpen(true)` behavior

### No changes to
- Session logic, card rendering, paywall, portal animation, or any other component

