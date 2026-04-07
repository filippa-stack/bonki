

## Fix: Free card 409 — create session after abandon completes

**File:** `src/pages/CardView.tsx` — 1 change

### Root cause
The abandon effect (line 433) and eager creation effect (line 454) race. The eager effect sees `normalizedSession.sessionId` is still set for another card and bails (line 463), but sometimes fires before the abandon completes, causing a 409.

### Change
In the abandon effect's async block (lines 433–439), after `refetch()` completes, immediately create the eager session for the new card instead of relying on the separate effect to re-trigger.

**Lines 433–439 → replace with:**

```typescript
(async () => {
  console.log('[lazy] abandon other session', normalizedSession.sessionId);
  await supabase.rpc('abandon_active_session', {
    p_session_id: normalizedSession.sessionId,
  });
  await normalizedSession.refetch();

  // Create session for the new card now that the old one is abandoned
  const needsEagerSession = isKidsProduct || product?.id === 'still_us';
  if (needsEagerSession && space?.id && cardId && !eagerSessionRef.current) {
    eagerSessionRef.current = true;
    const cardData = getCardById(cardId);
    if (cardData) {
      console.log('[eager] creating session after abandon for', cardId);
      const { error } = await supabase.rpc('activate_couple_session', {
        p_couple_space_id: space.id,
        p_category_id: cardData.categoryId,
        p_card_id: cardId,
        p_step_count: effectiveSteps.length,
        p_product_id: product?.id ?? 'still_us',
      });
      if (!error) {
        await normalizedSession.refetch();
      } else {
        console.error('[eager] session creation after abandon failed:', error);
      }
    }
  }
})();
```

### What stays unchanged
- The separate eager creation effect (lines 454–485) — still needed for the no-abandon path
- All other session logic, card rendering, non-free card behavior

