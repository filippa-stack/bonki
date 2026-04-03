

## Portal Page UX Upgrades (3 changes)

**File:** `src/pages/KidsCardPortal.tsx`

### Change 1: "✓ Genomfört" indicator below card title

After the `<h2>` title (line 505), inside the `textAlign: 'center'` div (line 494), add the conditional paragraph:

```tsx
{allTimeSet.has(card.id) && (
  <p style={{
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    fontWeight: 500,
    color: 'var(--text-primary, #FDF6E3)',
    opacity: 0.4,
    marginTop: '4px',
  }}>
    ✓ Genomfört
  </p>
)}
```

`allTimeSet` already exists (line 103).

### Change 2: Lock indicator on CTA button

At line 561-580, update the button to use conditional text, background, color, and boxShadow based on lock state:

```tsx
const isLocked = product && card.id !== product.freeCardId && !productIsPurchased && !bypassPaywall;
```

- **Text:** `isLocked ? 'Lås upp för att starta' : 'Starta samtal'`
- **background:** `isLocked ? 'rgba(255, 255, 255, 0.12)' : SAFFRON_FLAME`
- **color:** `isLocked ? 'var(--text-primary, #FDF6E3)' : '#1a1a1a'`
- **boxShadow:** `isLocked ? 'none' : \`0 4px 16px ${SAFFRON_FLAME}55\``

onClick unchanged — already opens paywall for locked cards.

### Change 3: Description text prominence

The subtitle `<p>` at line 530 already has `fontSize: '15px'` — no change needed there.

The metadata line at line 548: change `fontSize` from `'15px'` to `'13px'` and `fontWeight` from `600` to `500` to create more hierarchy (description sells, metadata informs). Add `marginBottom: '0px'` (already effectively 0).

Update the subtitle block (line 530-546): ensure `opacity: 0.85` is added to the style for slight emphasis consistency, and add `marginBottom: '4px'` to separate from metadata.

### Not changed
- Paywall intercept logic, PaywallBottomSheet, card navigation, browse sheet, GRATIS badge, session animation, card image rendering

