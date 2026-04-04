

## Journal Redesign — Prompt A (Visual Foundation)

**File:** `src/pages/Journal.tsx` — 4 changes

### Change 1: Hero + Stats Row (lines 939–964, 1036–1078)

**Remove** the entire pulse card block (lines 1036–1078) — the "Era samtal växer" gradient card with Senast link and product count.

**Replace** the header section (lines 942–964) with the new hero + stats layout:
- Title: "Era samtal" — `fontSize: 26px`, `fontWeight: 500`, `color: '#F5F0E8'`, `fontFamily: var(--font-serif)`
- Subtitle: "Vad ni burit med er" — `13px`, italic, `rgba(245,240,232,0.4)`
- Stats row (only when `!isEmpty && !loading`): two centered stats (Samtal count using `pulseData.total`, Produkter count using `pulseData.uniqueProductCount`) with `28px` golden numbers (`#E9C890`), `10px` uppercase labels (`rgba(245,240,232,0.45)`, letter-spacing `1.8px`), `gap: 2.5rem`

The `pulseData` object already provides `.total` and `.uniqueProductCount` — no new computation needed.

### Change 2: Filter Pill Styling (lines 966–1007)

Update all three filter buttons (Alla, Barn, Par):

**Inactive style:** `height: 28px`, `padding: 5px 14px`, `borderRadius: 16px`, `border: 0.5px solid rgba(245,240,232,0.12)`, `backgroundColor: transparent`, `color: rgba(245,240,232,0.45)`, `fontSize: 11px`, `fontWeight: 500`, `letterSpacing: 0.06em`, `textTransform: uppercase`

**Active style:** `backgroundColor: rgba(233,200,144,0.14)`, `color: #E9C890`, `border: 0.5px solid rgba(233,200,144,0.25)`

Rename `'Föräldrar'` → `'Par'` on line 1003.

### Change 3: Product-Colored Card Backgrounds (lines 242–248, 437–442)

**NoteEntryCard** (line 243): Change `backgroundColor: isTakeaway ? \`${accent.deep}14\` : '#2E3142'` → `backgroundColor: \`${accent.light}22\``  
Add: `border: \`0.5px solid ${accent.light}18\``

**SessionGroupCard** (line 438): Change `backgroundColor: '#2E3142'` → `backgroundColor: \`${accent.light}22\``  
Add: `border: \`0.5px solid ${accent.light}18\``

Both cards already have `borderRadius: 16px` and no left borders. Product name styling already uses `accent.light`. Keep reflection text as `#E9C890`.

### Change 4: Date Format Fix (lines 181–193)

Replace `formatRelativeDate` — remove the weekday-name branch (lines 189–190). After "igår", go straight to `"${day} ${month}"` format. Add year when different from current year. `SWEDISH_MONTHS` already exists on line 101.

New function body:
```tsx
function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'idag';
  if (diffDays === 1) return 'igår';
  const day = date.getDate();
  const month = SWEDISH_MONTHS[date.getMonth()];
  if (date.getFullYear() !== now.getFullYear()) {
    return `${day} ${month} ${date.getFullYear()}`;
  }
  return `${day} ${month}`;
}
```

### Not changed
- Data fetching, expand/collapse, navigation, auth, empty state
- Reflection color `#E9C890`
- All protected code patterns (suppressUntilRef, prevServerStepRef, hasSyncedRef, etc.)
- No other files

