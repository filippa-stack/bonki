

## Two bug fixes

### Bug 1 — "Utforska [product]" routes to intro page

**Root cause:** In `ProductHome.tsx`, the `useEffect` (line 46-49) unconditionally overrides the localStorage-based `showIntro = false` with `setShowIntro(true)` when `useProductIntroNeeded` returns `needed: true`. The DB hook checks for *completed sessions*, not whether the user has *seen the intro*. So a user who saw the intro and explored the free card — but hasn't completed any session — gets the intro again.

**Fix (line 46-49):** Add the localStorage check inside the effect so the DB result doesn't override an explicit "seen" flag:

```typescript
useEffect(() => {
  if (!introChecked) return;
  const alreadySeen = product?.id
    ? !!localStorage.getItem(`bonki-intro-seen-${product.id}`)
    : false;
  if (alreadySeen) {
    setShowIntro(false);
    return;
  }
  if (needsIntro) {
    setShowIntro(true);
  } else {
    setShowIntro(false);
    if (product?.id) localStorage.setItem(`bonki-intro-seen-${product.id}`, '1');
  }
}, [introChecked, needsIntro]);
```

This ensures the localStorage flag (set by KidsCardPortal and ProductIntro) takes priority over the DB check. No other file changes needed.

### Bug 2 — Library tile shows "Still Us" instead of "Vårt Vi"

**File:** `src/components/ProductLibrary.tsx`, line 1025

**Fix:** Change the hardcoded string from `Still Us` to `Vårt Vi`.

### Files changed
- `src/pages/ProductHome.tsx` — effect logic (lines 46-54)
- `src/components/ProductLibrary.tsx` — one string (line 1025)

