

## Library Tile Upgrades — Progress, Guidance, Recency

**File:** `src/components/ProductLibrary.tsx` only

### Change 1 — Expand data fetch + new state

Add two state variables next to `activeProductIds` (line 433):
```tsx
const [lastActivityMap, setLastActivityMap] = useState<Record<string, string>>({});
const [completedCountMap, setCompletedCountMap] = useState<Record<string, number>>({});
```

Replace the single query (lines 454-464) with parallel fetch:
- `fetchActive`: existing active sessions query (already there)
- `fetchCompleted`: `couple_sessions` where `status = 'completed'`, same space filter

In the `.then()`, populate all three state setters: `activeProductIds`, `lastActivityMap`, `completedCountMap`.

### Change 2 — `progressText` prop on PastelTile

Add `progressText?: string` to PastelTile props (line 219 area). Render below the "✦ Samtal 1 gratis" badge when non-empty — subtle `11px` white text at 50% opacity.

When mapping kids tiles (line 830), compute:
```tsx
const count = completedCountMap[product.id] || 0;
const progressText = count > 0 ? `${count} av ${product.cards.length} samtal` : undefined;
```

Also compute and pass `progressText` for the Still Us tile.

### Change 3 — `lastActive` prop + relative time on resume indicator

Add `formatRelativeTime` helper above the component. Add `lastActive?: string` prop to PastelTile. When provided and `hasActiveSession` is true, render the relative time below the "Fortsätt" label in `9px` text at 35% opacity.

Pass `lastActive={lastActivityMap[product.id]}` to each tile.

### Change 4 — "Next step" suggestion

Between the `LibraryResumeCard` div and the "FÖRÄLDRAR" section, add a conditional block:
- Only renders when `activeProductIds.size === 0` AND `completedCountMap` has entries AND there's an untried product
- Shows: "Nästa steg: prova **{name}** — ert första samtal är gratis."
- Styled as `13px` muted text with the product name highlighted in `#D4F5C0`

### Not changed
- Tile layout, colors, heights, border radius, illustrations
- Section headers ("FÖRÄLDRAR", "BARN & FAMILJ")
- Still Us tile structure (only props added)
- "Era samtal" card, LibraryResumeCard, sorting logic, loading gate
- No new files, hooks, or components

