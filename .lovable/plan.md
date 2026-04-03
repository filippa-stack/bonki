

## Fix Still Us Tile — Progress + Badge

**File:** `src/components/ProductLibrary.tsx`

### Issues found

The Still Us tile (lines 900-935) has a partial implementation with three bugs:
1. **Wrong freeCardId**: Checks `'su-01'` but the actual `freeCardId` is `'su-mock-0'` (from `still-us-mock.ts`)
2. **Inline layout**: Progress text sits inside a flex `div` with `gap: '8px'`, rendering beside the badge instead of below it
3. **Hardcoded count**: Uses `22` instead of `stillUsProduct?.cards.length`

### Changes

**Add product lookup** (near line 460, after existing state):
```tsx
const stillUsProduct = allProducts.find(p => p.id === 'still_us');
```

**Replace lines 892-936** — the "Trust signal badges" div and its contents — with:
```tsx
{/* Badge + progress */}
<div style={{ marginTop: '8px' }}>
  {(() => {
    const suCount = completedCountMap['still_us'] || 0;
    const suFreeCompleted = stillUsProduct?.freeCardId
      ? (completedCardSets['still_us']?.has(stillUsProduct.freeCardId) ?? false)
      : false;
    const totalCards = stillUsProduct?.cards.length ?? 22;
    return (
      <>
        {!suFreeCompleted && (
          <span style={{
            /* existing badge styles — unchanged */
          }}>
            ✦ Samtal 1 gratis
          </span>
        )}
        <span style={{
          display: 'block',
          marginTop: '6px',
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          fontWeight: 500,
          color: 'hsla(0, 0%, 100%, 0.5)',
        }}>
          {suCount > 0 ? `${suCount} av ${totalCards} samtal` : `${totalCards} samtal`}
        </span>
      </>
    );
  })()}
</div>
```

Key differences from current code:
- Parent is a plain `div` (no `display: flex`, no `gap`) so progress text falls to its own line
- Uses `stillUsProduct?.freeCardId` instead of hardcoded `'su-01'`
- Uses `stillUsProduct?.cards.length` instead of hardcoded `22`

### Not changed
- Tile layout, illustration, colors, border radius, height
- Resume indicator ("Fortsätt" + relative time)
- Kids product tiles, data fetch logic, any other file

