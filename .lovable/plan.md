

## Journal Redesign — Prompt B (Layout Structure)

**File:** `src/pages/Journal.tsx` — 3 changes

### Change 1: Timeline spine + card indentation (lines 1107–1139)

Wrap the `monthGroups.map(...)` block in a `position: relative` container. Add a vertical spine line as first child:

```tsx
<div style={{ position: 'relative' }}>
  {/* Spine */}
  <div style={{
    position: 'absolute',
    left: '2.05rem',
    top: 0,
    bottom: 0,
    width: '1px',
    backgroundColor: 'rgba(245, 240, 232, 0.07)',
    pointerEvents: 'none',
  }} />
  {monthGroups.map(...)}
</div>
```

Add `marginLeft: '1.75rem'` and `paddingLeft: '16px'` to the items container (line 1128) so cards sit to the right of the spine.

### Change 2: Month headers with dot marker (lines 1110–1125)

Replace the current month header (uppercase label + gradient line divider) with:
- A dot on the spine: 9px circle, golden (`#E9C890`) for current month, muted (`rgba(245,240,232,0.25)`) for past months
- Month name: 10px uppercase, letter-spacing 2px, golden for current month
- Right-aligned summary: `{group.items.length} samtal` — 11px italic, `rgba(245,240,232,0.35)`
- Remove the gradient `<div>` line divider entirely
- `isCurrentMonth` computed by comparing `group.key` against `monthKey(new Date().toISOString())`
- The header div gets `marginLeft: '1.75rem'` to align with the card area

### Change 3: Confirm card gap is 16px (line 1128)

The items container already has `gap: '16px'` — just confirm it stays. No change needed here.

### Not changed
- Card content/styling (product colors from Prompt A stay)
- Hero stats, filter pills, data fetching, expand/collapse
- Empty state, bookmarks section, Still Us collapsible section
- Reflection color `#E9C890`, navigation, auth
- Any other file

