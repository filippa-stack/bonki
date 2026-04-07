

## Three copy changes for conversion clarity

### Change 1 — Post-free-card badge on library tiles

**Files:** `src/components/ProductLibrary.tsx`

**Kids tiles (line ~416–439):** Instead of hiding the badge entirely when `hideFreeBadge` is true, show it with different text. Change from:

```tsx
{!hideFreeBadge && (
  <span ...>✦ Samtal 1 gratis{ageLabel ? ` · ${ageLabel}` : ''}</span>
)}
```

To render the badge always, but with conditional text:
- Not completed: `✦ Samtal 1 gratis` (current)
- Completed: `✦ 1 av {totalCards} utforskade` — where totalCards comes from a new prop (the product's total card count)

Add a `totalCards` prop to `PastelTile` and pass `product.cards.length` from the kids tile render loop (line ~1141). The badge styling stays identical.

**Still Us tile (line ~1048–1064):** Same pattern — when `suFreeCompleted` is true, show `✦ 1 av {totalCards} utforskade` instead of hiding the badge.

### Change 2 — Locked card CTA on portal

**File:** `src/pages/KidsCardPortal.tsx` (line 609)

Change: `'Lås upp för att starta'` → `'Lås upp alla samtal'`

### Change 3 — Prominent scope line on paywalls

**File:** `src/pages/PaywallFullScreen.tsx` (lines 247–258)
- Change `fontSize` from `'14px'` to `'16px'`
- Change `opacity` from `0.5` to `0.75`

**File:** `src/components/PaywallBottomSheet.tsx` (lines 284–294)
- Change `fontSize` from `'13px'` to `'15px'`
- Change `color` from `DRIFTWOOD` to `LANTERN_GLOW`
- Add `opacity: 0.75`
- Add `fontWeight: 500`

### Files changed
- `src/components/ProductLibrary.tsx` — badge logic + new prop
- `src/pages/KidsCardPortal.tsx` — one string
- `src/pages/PaywallFullScreen.tsx` — font size + opacity
- `src/components/PaywallBottomSheet.tsx` — font size + color + opacity

