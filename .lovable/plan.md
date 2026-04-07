

## Fix: Set intro-seen flag before "Utforska alla samtal" navigation

**File:** `src/pages/KidsCardPortal.tsx` — line 707

**Root cause:** The free card "Utforska alla samtal" button navigates to `/product/${product.slug}` without setting `bonki-intro-seen-{id}` in localStorage, so ProductHome re-shows the intro.

**Change:** Add the localStorage flag before navigating.

**Line 707 — replace:**
```typescript
onClick={() => isFreeCard ? navigate(`/product/${product.slug}`) : setBrowseOpen(true)}
```

**With:**
```typescript
onClick={() => {
  if (isFreeCard) {
    localStorage.setItem(`bonki-intro-seen-${product.id}`, '1');
    navigate(`/product/${product.slug}`);
  } else {
    setBrowseOpen(true);
  }
}}
```

Nothing else changes.

