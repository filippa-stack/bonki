

## Fix Reflection Count Filter

**File:** `src/pages/Journal.tsx` — 1 change

### Change (lines 923–931)

In the `heroStats` useMemo, change the reflection count source from `allTimelineItems` to `visibleItems`, and update the dependency array:

```tsx
const heroStats = useMemo(() => {
  const reflectionCount = visibleItems.filter(i => i.type === 'note').length;
  const sessionCount = filteredSessions.length;
  const monthSet = new Set(filteredSessions.map(s => {
    const d = new Date(s.ended_at || new Date().toISOString());
    return `${d.getFullYear()}-${d.getMonth()}`;
  }));
  return { reflectionCount, sessionCount, monthCount: monthSet.size };
}, [visibleItems, filteredSessions]);
```

`visibleItems` is the filtered timeline array that already respects the active Barn/Par filter (used by `groupedItems` → `monthGroups` → rendered cards).

### Not changed
- Samtal/Månader stats, hero layout/styling, any other logic or files

