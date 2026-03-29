

## Revised Plan: Filter Active Sessions from Still Us Archive View

### Concern Resolution
1. **Code style**: The existing query (line 298) already uses `.then()` chains — no style change needed. The plan matches.
2. **Orphaned UI**: No "Pågående samtal" or active-session list section exists anywhere. The archive block (line 2146) depends on `completedSessionId` — when null, nothing renders. No orphan risk.

### Implementation — `src/pages/CardView.tsx`

**Single change** to the session lookup query (lines 294-308):

Build the query conditionally — add `.eq('status', 'completed')` only when `isFromArchive` is true:

```typescript
useEffect(() => {
  if (devState) return;
  if (!space || !cardId) return;
  
  let query = supabase
    .from('couple_sessions')
    .select('id')
    .eq('couple_space_id', space.id)
    .eq('card_id', cardId);
  
  // Archive: only show completed sessions
  if (isFromArchive) {
    query = query.eq('status', 'completed');
  }
  
  query
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()
    .then(({ data }) => {
      setCompletedSessionId(data?.id ?? null);
    });

  // Count completed sessions (unchanged)
  supabase
    .from('couple_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('couple_space_id', space.id)
    .eq('status', 'completed')
    .eq('product_id', product?.id ?? 'still_us')
    .then(({ count }) => {
      setCompletedSessionCount(count ?? 0);
    });
}, [space, cardId, devState, showCompletion, product?.id, isFromArchive]);
```

Key points:
- Uses `let query` + conditional `.eq()` — standard Supabase builder pattern
- Adds `isFromArchive` to the dependency array
- Live/completion modes: unchanged (fetches latest session regardless of status)
- Archive mode: only completed sessions → active sessions produce `null` → no archive content renders

### Files Changed
1. `src/pages/CardView.tsx` — session lookup query + dep array

### Not Touched
- Four protected patterns remain unmodified
- No session creation, save, or reflection logic changes

