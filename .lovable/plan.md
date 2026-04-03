

## Completion Page Emotional Polish

**File:** `src/pages/CardView.tsx`

### Change 1: Add "Valfritt" label above reflection input

**Kids block (line ~1276–1289):** Before `<KidsCompletionNote .../>`, add the "Valfritt" tag:
```tsx
<p style={{
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  fontWeight: 500,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'rgba(253, 246, 227, 0.35)',
  textAlign: 'center',
  marginBottom: '8px',
}}>
  Valfritt
</p>
```

**Still Us block (line ~1529–1539):** Add same "Valfritt" tag above `<p>Något ni vill minnas?</p>`.

### Change 2: Add saffron completion indicator

**Kids block (line ~1200):** The kids block already has a creature circle + saffron ring (lines 1200–1256). No change needed — it already serves as the completion indicator.

**Still Us block (line ~1479–1481):** Replace the empty `<div style={{ height: '24px' }} />` spacer with the saffron checkmark circle:
```tsx
<div style={{ display: 'flex', justifyContent: 'center' }}>
  <div style={{
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'rgba(218, 157, 29, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  }}>
    <span style={{ color: '#D4A03A', fontSize: '18px' }}>✓</span>
  </div>
</div>
```

### Change 3: Demote "Nästa samtal" buttons to ghost style

**Kids block (lines 1387–1413):** Change the primary "Nästa samtal" button from filled saffron to ghost:
- `backgroundColor: 'transparent'`
- `border: '1px solid rgba(253, 246, 227, 0.2)'`
- `color: 'rgba(253, 246, 227, 0.7)'`
- Remove `<ArrowRight>` icon from the label

**Still Us block — su-mock-0 CTA (lines 1646–1666):** Same ghost treatment:
- `backgroundColor: 'transparent'` instead of `DEEP_SAFFRON`
- `border: '1px solid rgba(253, 246, 227, 0.2)'`
- `color: 'rgba(253, 246, 227, 0.7)'` instead of `MIDNIGHT_INK`
- Remove `<ArrowRight>`

**Still Us block — default next CTA (lines 1765–1785):** Same ghost treatment + remove `<ArrowRight>`.

**Still Us block — "all_complete" CTA (lines 1714–1733):** This goes to product home, keep as-is (it's already the only option).

### Change 4: Rename "Tillbaka till X" → "Till X"

**Kids block line 1411:** `Tillbaka till ${product?.name ?? 'översikt'}` → `Till ${product?.name ?? 'översikt'}`

**Kids block line 1435:** Same change.

**Still Us block line 1682:** `Tillbaka till Still Us` → `Till Still Us`

**Still Us block line 1732:** `Tillbaka till Ert utrymme` → `Till Ert utrymme`

**Still Us block line 1804:** `Tillbaka till ${product.name}` → `Till ${product.name}`

### Change 5: Rename "Gör:" → "Prova tillsammans:"

**Kids block line 1320:** `Gör: {gorExerciseSU.title}` → `Prova tillsammans: {gorExerciseSU.title}`

**Still Us block line 1575:** `Gör: {gorExerciseSU.title}` → `Prova tillsammans: {gorExerciseSU.title}`

### Not changed
- Completion headline text/random message system
- handleCompleteStep or any completion logic
- Reflection save/flush logic
- onClick navigation handlers
- Creature illustration on kids block
- suppressUntilRef, prevServerStepRef, clearTimeout(pendingSave), hasSyncedRef
- Any other file

