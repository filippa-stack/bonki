
Straightforward 3-edit change in one file. No exploration needed — the prompt specifies exact line numbers and replacements, and I verified `navigate` is already imported.

## ProductIntro: CTA → payment, skip → library

**File:** `src/components/ProductIntro.tsx`

### Change 1 — CTA label (line ~167)
Replace the conditional `ctaLabel` with a unified unlock label:
```tsx
const ctaLabel = `Lås upp ${product?.name ?? 'produkt'}`;
```

### Change 2 — `handleCta` (line ~147)
Route the CTA to `/buy?product={productId}` and persist a localStorage flag so the intro is skipped on return:
```tsx
const handleCta = async () => {
  markProductIntroSeenServer(productId);
  localStorage.setItem(`bonki-intro-seen-${productId}`, '1');
  navigate(`/buy?product=${productId}`);
};
```

### Change 3 — "Inte just nu" skip link (line ~384)
Send the user back to the library and persist the same localStorage flag:
```tsx
<button
  onClick={() => {
    markProductIntroSeenServer(productId);
    localStorage.setItem(`bonki-intro-seen-${productId}`, '1');
    navigate('/');
  }}
```

### Not changed
- `freeCardId` / `onStartFreeCard` props remain (callers untouched)
- All other UI, styling, imports, and helper functions
- No other files

### Verification
- Locked product → intro shows "Lås upp Jag i Mig"
- CTA → `/buy?product=jag_i_mig`
- "Inte just nu" → `/`
- Revisit → intro skipped via localStorage flag
