

## Fix: Resolve question text for demo diary entries in Journal

### Problem
The `getQuestionText` fix only applies to Supabase-backed reflections. Demo diary entries (used in local preview / demo mode) always pass `questionText: null` because the demo storage format doesn't include `step_index`. However, the `entryKey` field **does** encode the indices as `step-{stepIndex}-prompt-{promptIndex}`.

### File: `src/pages/Journal.tsx`

**Single change** (~line 647-651): Parse `entryKey` to recover `questionText` for demo entries.

```tsx
// Before
questionText: null,

// After
questionText: (() => {
  // entryKey format: "step-{stepIndex}-prompt-{promptIndex}"
  const match = entry.entryKey?.match(/^step-(\d+)-prompt-(\d+)$/);
  if (!match) return null;
  const encoded = Number(match[1]) * 100 + Number(match[2]);
  return getQuestionText(entry.cardId, encoded);
})(),
```

This reuses the existing `getQuestionText` helper — no new functions needed. Demo entries without a parseable `entryKey` (e.g. takeaways from SessionOneComplete) gracefully fall back to `null`.

### What stays untouched
- `getQuestionText` function
- Supabase-backed reflection logic
- `demoDiary.ts` storage format
- All other files and protected patterns

