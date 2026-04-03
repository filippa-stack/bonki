

## Fix Library Progress Indicators

**File:** `src/components/ProductLibrary.tsx` only

### Fix 1 — Count unique completed cards

**Lines 474, 503-531:** Add `completedCardSets` state. Change `fetchCompleted` to select `product_id, card_id`. Rebuild handler to deduplicate by card_id using Sets.

- New state: `const [completedCardSets, setCompletedCardSets] = useState<Record<string, Set<string>>>({});`
- Select becomes `.select('product_id, card_id')`
- Handler builds `Record<string, Set<string>>` then derives counts from `.size`

### Fix 2 — Progress text as block element

**Lines 428-441:** Change `display: 'inline-flex'` to `display: 'block'` and `marginTop` to `6px`.

### Fix 3 — Badge visibility via `hideFreeBadge` prop

**Line 230-237:** Add `hideFreeBadge?: boolean` to PastelTile props.

**Lines 404-427:** Wrap the "✦ Samtal 1 gratis" badge `<span>` in `{!hideFreeBadge && ( ... )}`.

**Lines 975-977 (kids tiles):** Compute `freeCardCompleted` from `completedCardSets`, change `progressText` to always show (either `"X av Y samtal"` or `"Y samtal"`), pass `hideFreeBadge={freeCardCompleted}`.

**Lines 892-921 (Still Us tile):** Same logic — conditionally hide badge, always show progress text.

### Not changed
- Tile layout, colors, heights, illustrations, border radius
- Data fetch structure (parallel `Promise.all`)
- `lastActivityMap`, `activeProductIds`, resume indicator
- "Next step" suggestion, sorting logic, loading gate
- Any other file

