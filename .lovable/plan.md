

## Plan: Fix completedSessionId query and add product filter to count

### Problem
1. The `completedSessionId` query filters on `status = 'completed'`, so sessions that are `'active'` (not yet explicitly completed) won't be found — archive reflections don't render.
2. The `completedSessionCount` query counts all completed sessions across all products, inflating the count.

### Changes (single file: `src/pages/CardView.tsx`)

**Lines 294–318** — Two modifications in the same useEffect:

1. **Remove `.eq('status', 'completed')`** from the session ID query (line 302). Keep `.order('started_at', { ascending: false })`. Add a comment: `// Fetches latest session (active or completed) — name is legacy`.

2. **Add product filter** to the count query: `.eq('product_id', product?.id ?? 'still_us')` before `.then()` (after line 314).

Result:
```typescript
useEffect(() => {
    if (devState) return;
    if (!space || !cardId) return;
    // Fetches latest session (active or completed) — name is legacy
    supabase
      .from('couple_sessions')
      .select('id')
      .eq('couple_space_id', space.id)
      .eq('card_id', cardId)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setCompletedSessionId(data?.id ?? null);
      });
    // Count completed sessions for this product
    supabase
      .from('couple_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('couple_space_id', space.id)
      .eq('status', 'completed')
      .eq('product_id', product?.id ?? 'still_us')
      .then(({ count }) => {
        setCompletedSessionCount(count ?? 0);
      });
  }, [space, cardId, devState, showCompletion, product?.id]);
```

**Dependency array**: Add `product?.id` since the count query now depends on it.

### What stays untouched
- Variable name `completedSessionId` kept (used in 24 places); comment explains legacy naming.
- All four protected ref patterns confirmed unmodified.
- No other files or useEffects changed.

