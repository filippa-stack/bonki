

## Separate 14-day expiry from sequencing logic

### File: `src/hooks/useKidsProductProgress.ts`

**1. Add `allTimeCompletedCardIds` to interface** (~line 56):
```tsx
allTimeCompletedCardIds: string[];
```

**2. Add `allTimeCompletedCardIds` memo** (after `recentlyCompletedCardIds` memo, ~line 235):
```tsx
const allTimeCompletedCardIds = useMemo(() => {
  const seen = new Set<string>();
  for (const s of completedSessions) {
    seen.add(s.card_id);
  }
  return [...seen];
}, [completedSessions]);
```

**3. Change sequencing/categoryProgress memo** (~line 243):
```tsx
// Before
const completedSet = new Set(recentlyCompletedCardIds);
// After
const completedSet = new Set(allTimeCompletedCardIds);
```

**4. Add to return value** — add `allTimeCompletedCardIds` to the result memo and its dependency array.

### No changes to any other file.

