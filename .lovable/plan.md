

## Fix Journal: Scope reflections query + resolve question text

### File: `src/pages/Journal.tsx`

**Change 1: Restructure data fetching** (lines 546–584)

Replace the parallel fire-and-forget pattern with an async function that fetches sessions first, then uses the session IDs to scope the reflections query. Takeaways and bookmarks fire in parallel with reflections.

```tsx
(async () => {
  const { data: sessionData } = await supabase
    .from('couple_sessions')
    .select(...)
    .eq('couple_space_id', space.id)
    ...;

  if (cancelled) return;
  const sessionList = sessionData ?? [];
  setSessions(sessionList);
  const sessionIds = sessionList.map(s => s.id);

  const [takeawayRes, reflectionRes, bookmarkRes] = await Promise.all([
    /* takeaways — unchanged */,
    sessionIds.length > 0
      ? supabase.from('step_reflections')...in('session_id', sessionIds)...
      : Promise.resolve({ data: [] }),
    /* bookmarks — unchanged */,
  ]);

  if (cancelled) return;
  setTakeaways(takeawayRes.data ?? []);
  setReflections(reflectionRes.data ?? []);
  setBookmarks(bookmarkRes.data ?? []);
})();
```

**Change 2: Add `getQuestionText` helper** (after `getCategoryName`, ~line 137)

Decodes `step_index` (encoded as `stepIndex * 100 + promptIndex`) back to the original prompt text by looking up the card in product manifests and legacy Still Us cards.

**Change 3: Use `getQuestionText` in reflection builder** (line 684)

Replace `questionText: null` with `questionText: getQuestionText(session.card_id, r.step_index)`.

### What stays untouched
- NoteEntryCard rendering (already handles `questionText`)
- SessionGroupCard
- Demo/local preview logic
- All other files
- All protected patterns

