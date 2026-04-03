

## Fix Journal Text Contrast

**File:** `src/pages/Journal.tsx`

### Change 1: Question text opacity
Lines 301, 483: `color: \`${LANTERN_GLOW}88\`` → `\`${LANTERN_GLOW}bb\``

Two locations — NoteEntryCard (line 301) and SessionGroupCard (line 483).

### Change 2: Card subtitle opacity
Line 462: `color: \`${LANTERN_GLOW}55\`` → `\`${LANTERN_GLOW}99\``

The card name text below the product name — currently at 33%, bump to ~60%.

### Change 3: Date labels
Line 458: `color: \`${LANTERN_GLOW}77\`` — already at 47%, this is acceptable per the hierarchy. No change needed.

### Change 4: "Visa alla" toggle text
Line 514: `color: \`${DRIFTWOOD}cc\`` → `\`${LANTERN_GLOW}77\``

Switches from driftwood to warm white at 47%.

### Change 5: Month headers
Line 1109: `color: \`${LANTERN_GLOW}88\`` — already at 53% with fontWeight 600. Bump to `\`${LANTERN_GLOW}99\`` for more presence since these are structural dividers.

### Change 6: Stats "Senast:" line
Line 1047: `color: \`${LANTERN_GLOW}88\`` → `\`${LANTERN_GLOW}aa\`` (67% — slightly brighter supporting text).

Line 1064: `color: \`${DRIFTWOOD}bb\`` → `\`${DRIFTWOOD}dd\`` (87% — already specified in prompt).

### Not changed
- User reflection color (#E9C890), filter chips/logic, Still Us toggle, data fetching, any other file.

