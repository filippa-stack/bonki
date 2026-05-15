## Hotfix: Resume query filters out empty-draft markers

**File:** `src/pages/CardView.tsx` (line 624)

**Change:** Add one line to the kids resume initializer query so it ignores the empty-text draft rows that `useSessionReflections` writes on every prompt mount.

```ts
const { data: rows, error } = await supabase
  .from('step_reflections')
  .select('step_index')
  .eq('session_id', normalizedSession.sessionId!)
  .eq('user_id', user.id)
  .gte('step_index', 0)
  .lt('step_index', 100)
  .neq('text', '')           // ← added
  .order('step_index', { ascending: false })
  .limit(1);
```

**Effect:** Resume now lands on the highest prompt with actual user-written text. Empty visits fall through to the existing "stay at 0" default. No other code paths touched (autosave, draft-marker creation, batch promote on completion, archive filtering, Still Us resume all unchanged).

**Verification:** Run the 8 manual scenarios listed in the request on iOS preview, plus a SQL check confirming empty-draft rows still exist in `step_reflections` after navigation.