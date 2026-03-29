

## Plan: Collapse Empty Sessions for ALL Products (Not Just Still Us)

### Problem
The collapsible "Samtal utan anteckningar" section only collects Still Us (par) empty sessions. Kids product empty sessions still render as inline checkmark rows, cluttering the timeline.

### Fix — `src/pages/Journal.tsx`

**One change to the filtering logic** (lines 570–592):

Currently, only `isPar && item.type === 'completed'` items go to `emptySU`. Change this so ALL `type === 'completed'` items (regardless of product) go into the collapsible section.

```
// Current (line 581):
if (item.type === 'completed') {
  emptySU.push(item);
  return;
}

// New — move the completed check OUTSIDE the isPar branch:
allTimelineItems.forEach(item => {
  const isPar = effectiveIsPar(item.productId, item.cardId);
  
  // All empty sessions go to collapsible, regardless of product
  if (item.type === 'completed') {
    if (isPar && !activeFilters.has('par')) return;
    if (!isPar && !activeFilters.has('barn')) return;
    if (isPar && bothActive && !parExpanded) return;
    emptySU.push(item);
    return;
  }
  
  // Notes: existing filter logic unchanged
  if (isPar) {
    if (!activeFilters.has('par')) return;
    if (bothActive && !parExpanded) return;
  } else {
    if (!activeFilters.has('barn')) return;
  }
  visible.push(item);
});
```

**No other changes needed** — the collapsible rendering section already works generically (card name + date).

### Files Changed
1. `src/pages/Journal.tsx` — filtering logic in `visibleItems` memo

### Not Touched
- No session logic, save logic, or useEffect changes
- Four protected patterns remain unmodified

