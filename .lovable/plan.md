

## Pre-Launch Polish: 8 Changes

### Change 1: "Gratis" reassurance on ProductIntro CTA
**File: `src/components/ProductIntro.tsx`** (~line 398, after CTA button, before skip link)

Add a paragraph:
```tsx
<p style={{
  fontFamily: 'var(--font-sans)',
  fontStyle: 'italic',
  fontSize: '14px',
  color: LANTERN_GLOW,
  opacity: 0.6,
  textAlign: 'center',
  marginTop: '12px',
  lineHeight: 1.5,
}}>
  Ert första samtal är gratis — ingen betalning krävs.
</p>
```

### Change 2: Kids completion — name the product
**File: `src/pages/CardView.tsx`**
- Line 1385: `'Tillbaka till översikt'` → `` `Tillbaka till ${product?.name ?? 'översikt'}` ``
- Line 1408: `'Tillbaka till översikt'` → `` {`Tillbaka till ${product?.name ?? 'översikt'}`} ``

### Change 3: Jag i Mig age label
**File: `src/data/products/jag-i-mig.ts`** (line 528)
- `ageLabel: undefined` → `ageLabel: '3+'`

### Change 4: Portal time estimates — keep editorial hardcoded values
The current `estimateMinutes` function already has per-product editorial values (e.g. 'ca 2–4 min' for Jag i Mig, 'ca 15–30 min' for Still Us). Per the product memory note, these are intentionally hardcoded for editorial control. **No change needed** — the current implementation is correct.

### Change 5: Keep full note trigger label
**File: `src/pages/CardView.tsx`** (~line 2711)
- `compactNoteTrigger={isAfterStep2}` → `compactNoteTrigger={false}`

Search confirms this is the only instance where `compactNoteTrigger` is set to a truthy value.

### Change 6: Journal toggle label
**File: `src/pages/Journal.tsx`** (line 1070)
- `'Dölj parsamtal'` → `'Dölj Still Us'`
- `parsamtal sparade` → `Still Us-samtal sparade`

### Change 7: Delete dead code
- Delete `src/components/StepReflection.tsx`
- Delete `src/components/LibraryResumeBanner.tsx`

### Change 8: Standardize price fallbacks to 249
**Files and lines:**
- `src/components/PurchaseScreen.tsx` line 33: `395` → `249`
- `src/pages/Category.tsx` line 129: `195` → `249`
- `src/pages/KidsCardPortal.tsx` line 149: `195` → `249`
- `src/pages/PaywallFullScreen.tsx` line 57: `195` → `249`
- `src/components/ProductPaywall.tsx` line 66: `195` → `249`
- `src/pages/Paywall.tsx` line ~193 (hardcoded "395 kr" display): → `249 kr`
- `PaywallBottomSheet.tsx` receives `priceSek` as prop — no fallback in this file, already handled by callers

### Not changed
- `estimateMinutes` function (Change 4) — editorial values are intentional per product memory
- No session logic, routing, DB queries, or protected patterns touched

