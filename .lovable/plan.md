## Ticket 3: Vi tab preview strip with 4 expandable tiles

### Pre-implementation finding (matters for the patch)

The Still Us cards in the actual product manifest are id'd `su-mock-${index}` (see `src/data/products/still-us-mock.ts`), and the `/card/:cardId` route resolves via `getCardById`, which only knows about manifest ids. Meanwhile `CARD_SEQUENCE[n].cardId` is the prefixed slug `su-07-smallest-we` — that string is **neither** a valid route param nor a key `useCardImage` resolves directly.

The clean way through: in the purchased-state tile, derive `const muxId = `su-mock-${seq.index}`` and use that for **both** `useCardImage(muxId)` and `navigate(/card/${muxId})`. `useCardImage` already handles `su-mock-N` natively (it internally maps to the bare id for the image file), so we don't need `bareIdFromSlug` at the call site at all.

This also means the `stillUsCompletedIds` set should hold `su-mock-${i}` strings (matching what `couple_sessions.card_id` actually stores for completed Still Us cards) — not the prefixed slug.

### File 1 — `src/lib/productPreviewQuestions.ts`

(Path correction: the file is at `src/lib/productPreviewQuestions.ts`, not `src/data/`. All app imports already use `@/lib/...`.)

Replace the `still_us` array (currently 3 entries) with:

```ts
still_us: [
  'Finns det något litet din partner gör — som alltid får dig att må lite bättre?',
  'Vad är det din partner förstår om dig — som du aldrig behövt förklara?',
  'Finns det något mellan er som fungerar så bra att ni aldrig pratar om det?',
  'Vad skulle din partner bli överraskad av att höra — om du berättade vad du just tänkte?',
],
```

All other arrays untouched. `PREVIEW_QUESTION` single-question accessor (which takes `[0]`) keeps working.

### File 2 — `src/components/ProductLibrary.tsx`

**Imports (top):**
- Update existing `framer-motion` import: add `AnimatePresence` alongside `motion`.
- Add `import { PREVIEW_QUESTIONS } from '@/lib/productPreviewQuestions';`
- Add `import { CARD_SEQUENCE } from '@/data/stillUsSequence';`
- Add `import { useCardImage } from '@/hooks/useCardImage';`

**Constants:** after `VI_TAB_HERO_COLOR`:
```ts
const PREVIEW_TILE_COLORS = [CORNFLOWER, DUSTY_ROSE, WARM_GOLD, STORM_GREY];
```

**New components between `VartViHero` and `LibraryKidsTile`:**

1. `VartViPreviewStrip({ isPurchased, completedCardIds, onUnpurchasedTileTap, onPurchasedTileTap })`
   - Props: `completedCardIds: Set<string>` of `su-mock-N` strings.
   - Unpurchased: 2×2 grid (`gap: 10`, `gridTemplateColumns: '1fr 1fr'`) of 4 `motion.button` tiles. Each tile: `layoutId={`preview-tile-${i}`}`, bg = `PREVIEW_TILE_COLORS[i]`, radius 12, min-height 130, padding `14px 12px`, hairline ring, italic display-serif body (`var(--font-display)`, italic, ~14px, line-height 1.3, `LANTERN_GLOW`), centered text. onClick → `onUnpurchasedTileTap(i)`.
   - Purchased: take `CARD_SEQUENCE.filter(s => !completedCardIds.has(`su-mock-${s.index}`)).slice(0, 4)`. If empty, return null. Render "NÄSTA" eyebrow (uppercase, 0.16em tracking, 11px, LANTERN_GLOW @ 0.55, margin-bottom 12) then a 2×2 grid of `PreviewCardPurchased` tiles colored by `PREVIEW_TILE_COLORS[i]`, passing `seqIndex={s.index}` + `title={s.title}` + `onClick={() => onPurchasedTileTap(`su-mock-${s.index}`)}`.

2. `PreviewCardPurchased({ seqIndex, title, bgColor, onClick })`
   - `const muxId = `su-mock-${seqIndex}`;`
   - `const image = useCardImage(muxId);`
   - Button: bgColor, radius 12, min-height 130, padding 10, flex column, gap 6, center align. If `image`, render `<img src={image}>` ~60–70px contain with small drop-shadow; else empty spacer. Below: title in display font, 13px, semibold, on-color text (LANTERN_GLOW), 2-line clamp (`WebkitLineClamp: 2`, `display: -webkit-box`, `WebkitBoxOrient: vertical`, overflow hidden).

**Inside the `ProductLibrary` default export:**

a. After `const [activeTab, ...]`, add:
```ts
const [expandedTileIndex, setExpandedTileIndex] = useState<number | null>(null);
```

b. After the `completedCountMap` effect, before `sortedKidsProducts`, add:
```ts
// COUNT-BASED APPROXIMATION — intentional. Do not replace with a Supabase
// query. The proper fix is a dedicated hook returning per-card completion
// IDs, which is a separate ticket. This approximation is correct for the
// majority of users who progress sequentially.
const stillUsCompletedIds = useMemo(() => {
  const count = completedCountMap['still_us'] || 0;
  return new Set(
    CARD_SEQUENCE.slice(0, count).map((s) => `su-mock-${s.index}`),
  );
}, [completedCountMap]);
```

c. Inside the `activeTab === 'vi'` block, immediately after `<VartViHero ... />`:
```tsx
<div style={{ marginTop: 20 }}>
  <VartViPreviewStrip
    isPurchased={purchased.has('still_us')}
    completedCardIds={stillUsCompletedIds}
    onUnpurchasedTileTap={(index) => setExpandedTileIndex(index)}
    onPurchasedTileTap={(cardId) => navigate(`/card/${cardId}`)}
  />
</div>
```

d. Just before the bottom safe-area spacing div, add the `<AnimatePresence>` overlay:
   - When `expandedTileIndex !== null`: `motion.div` backdrop, `position: fixed`, inset 0, `background: rgba(26,26,46,0.85)`, `backdropFilter: blur(8px)` (+ `-webkit-`), z-index 100, flex center, padding 24, `initial/animate/exit opacity 0→1→0`. onClick closes.
   - Inner `motion.div` with shared `layoutId={`preview-tile-${expandedTileIndex}`}`, bg = `PREVIEW_TILE_COLORS[i]`, radius 20, padding `48px 28px`, max-width 360, min-height 320, position relative, big shadow. `onClick={e => e.stopPropagation()}`.
   - Question text: display font italic, ~22px, line-height 1.35, LANTERN_GLOW, center-aligned.
   - `×` close button: top-right, 32×32, circular, `rgba(255,255,255,0.15)`, LANTERN_GLOW glyph, `aria-label="Stäng"`, closes on click.

### Untouched

TabBar, VartViHero, LibraryResumeCard, LibraryKidsTile, all data hooks, CARD_SEQUENCE, useCardImage, useAllProductAccess, completedCountMap fetching effect, ProductIntro.tsx, BuyPage.tsx, routing.

### Verification

- TS build clean.
- Unpurchased Vi tab: 4 colored tiles (cornflower / dusty rose / warm gold / storm grey) below the hero with the 4 new italic-serif questions. Tap → shared-layout expand to full-screen card on blurred backdrop. `×` or backdrop tap collapses back.
- Purchased Vi tab: "NÄSTA" eyebrow + 4 tiles showing illustration + title for the next 4 uncompleted `CARD_SEQUENCE` entries; tap navigates to `/card/su-mock-{index}` (matches existing route resolution).
- ProductIntro and BuyPage automatically reflect the 4-question array.
