

## Fix: Create Draft Row on Prompt Landing

**Root cause:** `useSessionReflections` never writes a `step_reflections` row when a user lands on a prompt — it only writes when `setText` is called (user types) or `markReady` is called. Users who advance without typing leave no trace in `step_reflections`, so resume queries find nothing.

**File:** `src/hooks/useSessionReflections.ts`

**Change:** Add a "touch" upsert at the end of the fetch effect (effect #2, around line 115–140). After fetching the existing reflection, if no row exists (`data` is null), upsert an empty draft row. This ensures every prompt the user visits has a `step_reflections` row.

After the `if (data) { ... }` block and before `setLoading(false)`, add:

```tsx
// If no existing reflection, create an empty draft row to track prompt visit
if (!data && sessionId && user.id) {
  supabase
    .from('step_reflections')
    .upsert(
      {
        session_id: sessionId,
        step_index: stepIndex,
        user_id: user.id,
        text: '',
        state: 'draft' as any,
      },
      { onConflict: 'session_id,step_index,user_id' }
    )
    .then(({ error }) => {
      if (error) console.error('Failed to create draft marker:', error);
    });
}
```

This is fire-and-forget — it doesn't block loading or affect local state. The `onConflict` clause makes it idempotent (safe if a row already exists from a previous visit).

**No other files changed.** The resume queries in CardView.tsx and LibraryResumeCard.tsx are already correct — they just need rows to exist.

**Verification:**
- Start a session, advance to prompt 3 without typing anything
- Exit → library banner shows "Pausad vid Fråga 3 av 5"
- Tap "Fortsätt" → resumes at prompt 3
- Start a session, type on prompt 2, advance to prompt 4 → banner shows "Fråga 4 av 5"

