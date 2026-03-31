

## Fix: Journal.tsx ("Era samtal") entrance flicker

### Root cause
Journal.tsx has mount-based `initial={{ opacity: 0 }}` animations on multiple elements — the same pattern already fixed across other pages. The `/saved` route redirects to `/journal`, so the page the user sees is `Journal.tsx`, not `SavedConversations.tsx`.

### Changes — 1 file: `src/pages/Journal.tsx`

**Header (lines 678-703):** Change `initial={{ opacity: 0, y: -10 }}` → `initial={false}`, remove `animate` and `transition` props. Title + subtitle render instantly.

**Filter chips (lines 707-734):** Change `initial={{ opacity: 0 }}` → `initial={false}`, remove `animate` and `transition`.

**Empty state (lines 744-772):** Change `initial={{ opacity: 0, y: 12 }}` → `initial={false}`, remove `animate` and `transition`. "Det finns inget här ännu" renders instantly.

**Pulse card (lines 778-818):** Change `initial={{ opacity: 0, y: 12 }}` → `initial={false}`, remove `animate` and `transition`.

**Par privacy row (lines 823-849):** Change `initial={{ opacity: 0 }}` → `initial={false}`, remove `animate` and `transition`.

**NoteEntryCard (lines 207-210):** Change `initial={{ opacity: 0, y: 8 }}` → `initial={false}`, remove `animate` and `transition`.

**CompletedMarkerRow (lines 331-334):** Change `initial={{ opacity: 0 }}` → `initial={false}`, remove `animate` and `transition`.

**Keep unchanged:** The collapsible `AnimatePresence` blocks (empty sessions accordion at line 910, chevron rotations) — these are user-triggered interactions, not mount animations.

### No other files modified

