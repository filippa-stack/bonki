

## Revised: Add Meta Pixel Tracking

Same plan as before with one adjustment to the `Index.tsx` purchase block — reorder to: read `returnCard` → fire pixel → strip param. This matches the user's preferred clarity.

### Files and changes

**1. `index.html`** — Add Meta Pixel base script in `<head>`, `<noscript><img>` fallback in `<body>`.

**2. Create `src/lib/metaPixel.ts`** — Type-safe `trackPixelEvent` wrapper with UUID `eventID` generation for CAPI dedup.

**3. `src/contexts/AuthContext.tsx`** — Fire `CompleteRegistration` on `SIGNED_IN` only if `created_at` < 60s ago.

**4. `src/components/Onboarding.tsx`** — Fire `Lead` alongside existing `trackOnboardingEvent`.

**5. `src/pages/Index.tsx`** — Purchase block (revised order):
```tsx
if (searchParams.get('purchase') === 'success') {
  const returnCard = searchParams.get('returnCard');
  trackPixelEvent('Purchase', { value: 249, currency: 'SEK' });
  window.history.replaceState({}, '', window.location.pathname);
  if (returnCard) {
    return <Navigate to={`/card/${returnCard}`} replace />;
  }
}
```

**6. `src/App.tsx`** — Add `RoutePageViewTracker` component using `useLocation` + `useEffect` to fire `PageView` on route changes.

### Not changed
- No new dependencies, no backend changes
- Protected patterns untouched
- No Purchase tracking in Paywall files

