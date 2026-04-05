

## Remove `localStorage.removeItem` from ProductHome Back Buttons

**File:** `src/pages/ProductHome.tsx` — 2 changes

### Change 1: Product-not-found back button (~line 109)
Remove `localStorage.removeItem('bonki-last-active-product');` from the onClick handler, keeping only `navigate('/');`.

### Change 2: Header back button (~line 138)
Same removal — keep only `navigate('/');`.

### Not changed
- `ProductIntro.tsx` (keeps its `removeItem`)
- `ProductHomeBackButton.tsx`, `BottomNav.tsx`, all other files

