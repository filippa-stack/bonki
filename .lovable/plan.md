

## Plan: Three Visual Changes to Still Us Archive

### Summary
Three rendering-only changes across two files. No database changes, no session logic changes.

### Key Technical Insight
`step_reflections` has no `prompt_index` column. The prompt index is encoded in `step_index`: `promptIndex = step_index % 100`. For Still Us cards (single opening section, step 0), reflections are at step_index 0, 1, 2, 3, 4 — so `Fråga N` = `(step_index % 100) + 1`.

---

### Change 1 — Collapsible empty sessions section (`src/pages/Journal.tsx`)

Currently, sessions without notes render inline as `CompletedMarkerRow` entries mixed into the month timeline. For Still Us sessions only, collect them into a separate collapsible section at the bottom.

**What to do:**
- In the `allTimelineItems` memo (line ~546), Still Us completed-no-note items are added as `type: 'completed'`. Keep this logic but filter them OUT of the main timeline rendering.
- After the timeline month groups and before the paused sessions section (~line 867), add a new collapsible section:
  - Collect all `CompletedMarker` items where `effectiveIsPar(productId, cardId)` is true
  - If count > 0, render a collapsible header: `Samtal utan anteckningar (N)` with a chevron
  - Default state: collapsed (new `useState(false)`)
  - When expanded: compact rows — card title left, date (`D MMM` format) right
  - Style: `opacity: 0.5`, `fontSize: 13px`, no card border/background
  - 24px top margin to separate from content above

### Change 2 — Question labels on reflections (`src/components/LockedReflectionDisplay.tsx`)

For each reflection entry, derive the prompt index from `step_index % 100` and display `Fråga N` above the reflection text.

**What to do:**
- Extend `ReflectionEntry` interface to include the raw `stepIndex` (already there)
- For each entry, compute `promptLabel = \`Fråga ${(entry.stepIndex % 100) + 1}\``
- Render it as a `<p>` above the reflection `<motion.div>`:
  - `fontSize: '12px'`, `opacity: 0.5`, `color: 'var(--text-secondary)'`
  - `marginBottom: '4px'`
- Skip this label for the completion entry (Change 3 handles that)

### Change 3 — Completion reflection styling (`src/components/LockedReflectionDisplay.tsx`)

Already partially implemented — "Ert takeaway" label and left border exist. Adjustments needed:

**What to do:**
- For the completion entry (`entry.stepIndex === maxStepIndex`), show `Ert takeaway` instead of `Fråga N`
- Keep existing styling: gold label color `#D4A03A`, left border `3px solid rgba(212, 160, 58, 0.20)`
- Ensure completion entry renders LAST in the list (sort entries so maxStepIndex entry is at bottom)
- If no completion reflection exists, do nothing — already handled by the filter

### Files Changed
1. **`src/pages/Journal.tsx`** — Add collapsible empty-sessions section for Still Us
2. **`src/components/LockedReflectionDisplay.tsx`** — Add "Fråga N" labels + ensure completion takeaway distinction

### Not Touched
- No session logic, save logic, or useEffect changes
- Four protected patterns remain unmodified
- No files outside the archive rendering path

