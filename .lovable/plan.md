

## Fix: Remove localStorage clear from Biblioteket tap

**File:** `src/components/BottomNav.tsx`

### Change

Remove line 105: `localStorage.removeItem('bonki-last-active-product');` from the library tap handler.

The resulting handler becomes:
```tsx
if (item.id === 'library') {
  navigate('/');
  return;
}
```

**Why it's safe:** The skip-to-product redirect in `Index.tsx` uses `sessionStorage` (`bonki-skip-to-product-done`), not `localStorage`. That guard fires once per browser session and won't re-trigger when navigating to `/` via the library tab. No other code depends on this key being cleared on library tap.

No other files changed.

