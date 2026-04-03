

## Journal "Era samtal" Visual Upgrades (4 changes)

**File:** `src/pages/Journal.tsx`

### Change 1: Warm saffron color for user reflections

**NoteEntryCard** (line 328): `color: LANTERN_GLOW` → `color: '#E9C890'`

**SessionGroupCard** note text (line 494): `color: LANTERN_GLOW` → `color: '#E9C890'`

Question text stays unchanged (`LANTERN_GLOW` at 88 opacity, italic).

### Change 2: Warmer opening line

Line 1028-1030: Change text from `Ni har haft` ... `samtal sedan` to:

```
Era samtal växer —{' '}
<span ...>{pulseData.total}</span>
{' '}sedan {pulseData.monthLabel}.
```

### Change 3: Show 1 note by default

Line 427: `COLLAPSE_THRESHOLD = 3` → `1`
Line 429: slice already uses `COLLAPSE_THRESHOLD`, so it will automatically show 1.
Toggle text (line 522) already reads `Visa alla (N)` / `Visa färre` — no change needed.

### Change 4: Warmer Still Us toggle text

Line 1071:
- `'Dölj Still Us'` → `'Visa mindre'`
- `` `Ni har ${stillUsSessions.length} Still Us-samtal sparade` `` → `` `Still Us · ${stillUsSessions.length} samtal` ``

### Not changed
- Data fetching, filter logic, navigation, component structure, expand/collapse state, page header, empty state, any other file.

