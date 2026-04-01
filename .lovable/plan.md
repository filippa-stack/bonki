

## Journal Page — Gap to 10/10

### Current Issues (from screenshots)

1. **Metadata placement inconsistency**: `NoteEntryCard` puts product name + card name at the *bottom*, while `SessionGroupCard` puts it at the *top*. Mixed in the same timeline, this creates visual chaos.

2. **Single-word reflections get full cards**: Entries like "du", "hej", "är" each occupy a full 16px-padded card with accent bar, metadata row, and 16px border-radius. Enormous visual weight for zero content.

3. **Takeaway label opacity mismatch**: Solo `NoteEntryCard` takeaway label uses `${accent.mid}b3` (70%) while `SessionGroupCard` uses `${accent.mid}dd` (87%). Should be consistent.

4. **Question text appears after the answer**: In `NoteEntryCard`, the `— questionText` italic line sits below the reflection. Editorially backwards — the prompt should contextualize *before* the answer.

5. **No card name in SessionGroupCard header for context**: The card name (`Arg`, `Att nå fram`) is in 12px muted text, easy to miss. Should be slightly more prominent as it's the conversation topic.

6. **"Dölj parsamtal" toggle** uses raw `DRIFTWOOD` which is dim and feels like a debug element, not editorial UI.

### Plan (1 file: `src/pages/Journal.tsx`)

**Change 1: Move metadata to top in `NoteEntryCard` (lines 200-323)**
- Move the product name + date + card name block from below the reflection text to above it (after the accent bar), matching `SessionGroupCard` layout.
- This creates consistent top-down hierarchy: accent bar → metadata → content.

**Change 2: Question text above reflection (lines 288-300)**
- Move the `— questionText` italic line to appear *before* the reflection text, not after.
- Provides editorial context: "Here's what was asked → here's what you wrote."

**Change 3: Consistent takeaway label opacity (line 234)**
- Change `${accent.mid}b3` → `${accent.mid}dd` to match `SessionGroupCard`.

**Change 4: Card name size bump in `SessionGroupCard` (line 429)**
- Increase from `12px` → `13px` and from `${DRIFTWOOD}bb` → `${LANTERN_GLOW}55` for better topic visibility.

**Change 5: "Dölj parsamtal" button styling (line 1021)**
- Change text color from `DRIFTWOOD` to `${LANTERN_GLOW}77` for better visibility.
- Change chevron color similarly.

### What stays untouched
- All data fetching, grouping, filtering logic
- SessionGroupCard overall structure
- Layout, gap, border-radius values
- Font families and weights
- Pulse card design
- Empty state, bookmarks, month headers

