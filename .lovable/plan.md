

## Fix: Show question text in SessionGroupCard

### Problem
When a session has 2+ reflections (or 1 + takeaway), the Journal groups them into a `SessionGroupCard`. This component renders each note's `.text` but **never renders `.questionText`** — the question is simply ignored. Solo notes use `NoteEntryCard`, which does render the question (line 294: `— {entry.questionText}`).

This is why:
- "Arg" (8 reflections) → grouped → no questions
- "Äcklad" (1 reflection) → solo card → question visible
- "Ledsen" (1 reflection) → solo card → question visible

### Fix

**File: `src/pages/Journal.tsx`** — `SessionGroupCard` component, lines 477-489

Add the question text line before each note's text, matching the same style used in `NoteEntryCard`:

```tsx
// Current (line 477-489):
<p style={{ ... serif italic ... }}>
  {note.text...}
</p>

// After:
{note.questionText && (
  <p style={{
    margin: '0 0 4px',
    fontSize: '13px',
    fontStyle: 'italic',
    color: `${LANTERN_GLOW}88`,
    lineHeight: 1.4,
  }}>
    — {note.questionText}
  </p>
)}
<p style={{ ... serif italic ... }}>
  {note.text...}
</p>
```

### What stays untouched
- `NoteEntryCard` rendering (already correct)
- Grouping logic
- Data fetching and `getQuestionText` helper
- All protected patterns

