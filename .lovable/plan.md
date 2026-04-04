

## Fix Journal Hero Stats

**File:** `src/pages/Journal.tsx` — 2 changes

### Change 1: Add heroStats useMemo (after line 921)

Insert a new `useMemo` block computing three stats from `allTimelineItems` and `filteredSessions` (or `sessions` if `filteredSessions` isn't available at that scope):

```tsx
const heroStats = useMemo(() => {
  const reflectionCount = allTimelineItems.filter(i => i.type === 'note').length;
  const sessionCount = filteredSessions.length;
  const monthSet = new Set(filteredSessions.map(s => {
    const d = new Date(s.last_activity_at || s.created_at);
    return `${d.getFullYear()}-${d.getMonth()}`;
  }));
  return { reflectionCount, sessionCount, monthCount: monthSet.size };
}, [allTimelineItems, filteredSessions]);
```

### Change 2: Replace stats row JSX (lines 975–1021)

Replace the current two-stat block (`pulseData.total` / `pulseData.uniqueProductCount`) with three stats: **Reflektioner**, **Samtal**, **Månader** — all using `heroStats`. Same styling (28px golden numbers, 10px uppercase labels). Condition changes from `pulseData` to `heroStats`.

### Not changed
- Hero title/subtitle, filter pills, card styling, timeline, data fetching, any other file

