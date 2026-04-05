

## Pre-Launch Audit Fixes (4 items)

Four files, one surgical change each.

### Fix 1: Journal loading gate — add `hasRenderedContent` guard
**File:** `src/pages/Journal.tsx` — line 1110

```
// FROM:
{loading ? (
// TO:
{(loading && !hasRenderedContent.current) ? (
```
Ref already exists and is used on the `isEmpty` branch below.

### Fix 2: CardView loading gate — fix cream CSS fallback
**File:** `src/pages/CardView.tsx` — line 1076

```
// FROM:
const loadingBg = product?.backgroundColor ?? 'var(--surface-base, hsl(46, 64%, 89%))';
// TO:
const loadingBg = product?.backgroundColor ?? 'var(--surface-base, #0B1026)';
```

### Fix 3: KidsCardPortal — replace DRIFTWOOD in error state
**File:** `src/pages/KidsCardPortal.tsx` — line 273

```
// FROM:
<p style={{ color: DRIFTWOOD, fontSize: '14px' }}>
// TO:
<p style={{ color: 'rgba(253, 246, 227, 0.7)', fontSize: '14px' }}>
```

### Fix 4: Journal — replace `useDefaultTheme` with inline cleanup
**File:** `src/pages/Journal.tsx`

- **Line 4:** Remove `import { useDefaultTheme } from '@/hooks/useDefaultTheme';`
- **Line 1:** Add `useLayoutEffect` to React import → `import { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';`
- **Line 577:** Replace `useDefaultTheme();` with:
```tsx
useLayoutEffect(() => {
  document.documentElement.classList.remove('theme-verdigris');
  document.body.classList.remove('verdigris-grain', 'verdigris-lightleak');
}, []);
```

### Not changed
All logic, state, data fetching, ref declarations, and all other files remain untouched.

