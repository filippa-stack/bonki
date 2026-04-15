

## Remove "gratis" Messaging from ProductIntro

### Change
**File:** `src/components/ProductIntro.tsx`, lines 382–395

Remove the `{hasFreeCard && (...)}` paragraph block that displays "Ert första samtal är gratis — ingen betalning krävs." below the CTA button.

Everything else stays untouched: CTA button, `handleCta`, "Inte just nu" link, imports, `hasFreeCard` variable.

### Files Modified
- `src/components/ProductIntro.tsx` (1 block removed)

