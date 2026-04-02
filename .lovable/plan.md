

## Fix: Simplify audience routing — read in render, clean up in effect

**File:** `src/pages/Index.tsx` only

### Changes

1. **Remove** `audienceRef` declaration and all `audienceRef.current` references
2. **Add cleanup effect** (next to existing migration effect):
```tsx
useEffect(() => {
  const audience = localStorage.getItem('bonki-onboarding-audience');
  if (audience) {
    localStorage.removeItem('bonki-onboarding-audience');
    localStorage.setItem('bonki-first-session-done', '1');
  }
}, []);
```
3. **Routing block** (same position — before onboarding gate) reads localStorage directly, no mutation:
```tsx
const audience = localStorage.getItem('bonki-onboarding-audience');
if (audience && !localStorage.getItem('bonki-first-session-done')) {
  const routes: Record<string, string> = {
    young: '/product/jag-i-mig',
    middle: '/product/jag-med-andra',
    teen: '/product/jag-i-varlden',
    couple: '/product/still-us',
  };
  const target = routes[audience] || '/';
  return <Navigate to={target} replace />;
}
```

No new localStorage keys. No `bonki-audience-routed`. No other files touched.

