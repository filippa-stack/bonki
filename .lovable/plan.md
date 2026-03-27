

## Plan: Broaden eager session creation to include Still Us

### What and why
Line 406 in `CardView.tsx` restricts eager session creation to kids products only. Still Us cards need the same treatment so `normalizedSession.sessionId` is available when `SessionStepReflection` mounts.

### Change (single file: `src/pages/CardView.tsx`)

**Line 406** — replace the guard:
```typescript
// Before:
if (!isKidsProduct || devState || isFromArchive || showCompletion) return;

// After:
const needsEagerSession = isKidsProduct || product?.id === 'still_us';
if (!needsEagerSession || devState || isFromArchive || showCompletion) return;
```

**Line 435** — add `product?.id` to the dependency array:
```typescript
// Before:
}, [isKidsProduct, devState, isFromArchive, showCompletion, normalizedSession.loading, normalizedSession.sessionId, space?.id, cardId]);

// After:
}, [isKidsProduct, product?.id, devState, isFromArchive, showCompletion, normalizedSession.loading, normalizedSession.sessionId, space?.id, cardId]);
```

### Verification
After the edit, search for and confirm all four protected patterns remain untouched:
1. `suppressUntilRef.current = Date.now() + 2000` in `useNormalizedSessionState.ts`
2. `prevServerStepRef.current = serverStepIndex` in `CardView.tsx`
3. `clearTimeout(pendingSave.current)` in `useSessionReflections.ts`
4. `hasSyncedRef.current = true` in `SessionStepReflection.tsx`

No other files or useEffects are modified.

