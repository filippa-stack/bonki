

## Area 6 Fixes: Console cleanup + BottomNav portal match

Two pre-launch fixes, both surgical and zero-risk.

### Change 1: Remove diagnostic console logs

**File: `src/pages/CardView.tsx`**
- Remove all `console.log('[DIAG] ...')` calls (~lines 2826, 2838, 2872–2873, 2898–2899)
- Keep the actual logic intact; just strip the log statements
- The `onClick` handlers that wrap `console.log` + function call become direct function calls

**File: `src/hooks/useKidsProductProgress.ts`**
- Remove the entire `useEffect` debug block (lines 304–316) — it only fires for Still Us and logs internal state to the console on every render cycle

### Change 2: Fix BottomNav Still Us tab matching for portal routes

**File: `src/components/BottomNav.tsx`** (line 54–61)

Replace the exact match `p === '/product/still-us'` with `p.startsWith('/product/still-us')`. This covers `/product/still-us`, `/product/still-us/portal/...`, and any future sub-routes.

```tsx
match: (p, _s) =>
  p.startsWith('/product/still-us') ||
  p.startsWith('/still-us') ||
  p.startsWith('/check-in') ||
  p.startsWith('/session/') ||
  p === '/share' ||
  p === '/journey' ||
  p === '/ceremony',
```

### What stays untouched
- BUG-UI1 (latent prompt count mismatch) — deferred, not currently triggered
- INCON-1 (progress bar 50% vs actual) — deferred, displays are on different screens
- All protected patterns, AnimatePresence, routing keys, 100dvh

