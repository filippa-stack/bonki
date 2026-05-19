# Ticket 3 Follow-ups

Two surgical UI fixes per spec. No data, hooks, or routing changes.

## File 1 — `src/components/LibraryResumeCard.tsx`

In the medallion's `isStillUs` branch, replace the single `<img src={ILLUSTRATIONS.still_us}>` with a conditional:

- If `illustration` (already resolved via `useCardImage` higher in the component) is available → render it as a full-bleed card image (width/height 100%, `objectFit: contain`, `padding: 4`, drop-shadow).
- Fallback → existing product-level `ILLUSTRATIONS.still_us` rendering, untouched.

Kids branch unchanged. No new imports.

## File 2 — `src/components/ProductLibrary.tsx`

### VartViPreviewStrip purchased branch

Replace the `nextFour` slice with the always-4 padding logic:

1. `uncompleted` = CARD_SEQUENCE not in `completedCardIds` (`su-mock-${i}` keys).
2. `completed` = CARD_SEQUENCE in `completedCardIds`, reversed (most-recent first).
3. Build `previewCards: { seq, isCompleted }[]` by pushing uncompleted first, then completed, capping at 4.
4. Early-return `null` only if `previewCards.length === 0`.

### Eyebrow

`eyebrowLabel = uncompleted.length > 0 ? 'Nästa' : 'Era samtal'`.

### Map

Pass `isCompleted` into each `<PreviewCardPurchased>`.

### PreviewCardPurchased component

Update signature to add `isCompleted: boolean`. Render changes:

- Wrap with `position: relative`, `opacity: isCompleted ? 0.78 : 1`.
- When `isCompleted`, add absolutely-positioned saffron (#E9B44C) SVG check in top-right (16×16).
- Image and title layout unchanged otherwise.

## Out of scope

Duplicate-with-resume-banner issue, typography, kids tiles, TabBar, VartViHero, expansion overlay, routing, all data/hooks/state.

## Verification

- Build clean.
- Paused Vårt Vi resume banner medallion shows the per-card illustration.
- Vi tab (purchased) always renders 4 tiles; completed fillers show saffron check + ~78% opacity.
- Eyebrow flips to "Era samtal" when all 18 cards completed.
- ProductIntro / BuyPage unaffected.
