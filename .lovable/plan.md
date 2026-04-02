

## Paywall Dismiss → Library Route

Change dismiss/decline CTAs across all paywall surfaces to label "Utforska andra produkter" and navigate to `"/"`.

### Files & Changes

**1. `src/pages/PaywallFullScreen.tsx` (line ~309)**
- Label: "Inte just nu" → "Utforska andra produkter"
- onClick: already navigates to product slug → change to `navigate('/', { replace: true })`

**2. `src/pages/Paywall.tsx` (line ~251)**
- Label: "Inte nu" → "Utforska andra produkter"
- onClick: `navigate('/product/still-us')` → `navigate('/', { replace: true })`

**3. `src/components/ProductPaywall.tsx` (two instances, lines ~366 and ~568)**
- Label: "Inte nu" → "Utforska andra produkter" (both)
- onClick: both already use `handleDismiss` / `navigate(backTo)` → change to `navigate('/', { replace: true })`

**4. `src/components/PaywallBottomSheet.tsx` (line ~398)**
- "Tillbaka" button — this is the sheet's close/back action, contextually different from a paywall dismiss. **Leave unchanged** per the prompt's intent (it closes the overlay, not a paywall decline).

**Not changed:** `ProductIntro.tsx` and `FeedbackSheet.tsx` — these are not paywall surfaces (ProductIntro is an intro overlay, FeedbackSheet is feedback). `CardTakeaways.tsx` is a share preview dismiss. Per the prompt, only paywall dismiss CTAs are modified.

### Styling
Keep existing styling unchanged on all buttons (ghost/muted, same font, size, color).

### Summary
4 label changes + 4 navigation target changes across 3 files. No purchase flow, pricing, or success routing modified.

