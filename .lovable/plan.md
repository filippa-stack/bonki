

## Fix Auth Race Condition

**Problem**: `onAuthStateChange` can fire with a `null` session before `getSession()` resolves the stored session, causing `loading` to become `false` prematurely. Downstream hooks see `user = null` and set `space = null`, killing resume banners.

**Change**: Single edit in `src/contexts/AuthContext.tsx` lines 57–78. Add an `initialSessionResolved` flag so the auth listener only calls `setLoading(false)` after `getSession()` has run.

### File: `src/contexts/AuthContext.tsx`

Replace the `useEffect` block (lines 57–78) with the user's provided code that introduces the `initialSessionResolved` guard.

No other files are modified.

