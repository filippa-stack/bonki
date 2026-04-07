

## Fix: Sync effect consumes stale reflection data

**File:** `src/pages/CardView.tsx` — lines 714–723

### Change

Add a stale-data guard: if `myReflection` exists but its `stepIndex` doesn't match `kidsNoteStepIndex`, bail out early (don't set `kidsNoteSyncedRef = true`). This lets the effect re-run when the hook fetches the correct prompt's data.

**Lines 714–723 — replace:**

```typescript
    if (kidsNoteSyncedRef.current) return;
    kidsNoteSyncedRef.current = true;
    console.log('[kids-note-sync]', {
      hasText: !!kidsNoteSession.myReflection?.text,
      text: kidsNoteSession.myReflection?.text?.slice(0, 20),
      stepIndex: kidsNoteSession.myReflection?.stepIndex,
      expectedStep: kidsNoteStepIndex,
      sessionId: kidsNoteSession.sessionId,
    });
    if (kidsNoteSession.myReflection?.text && kidsNoteSession.myReflection.stepIndex === kidsNoteStepIndex) {
```

**With:**

```typescript
    if (kidsNoteSyncedRef.current) return;
    if (kidsNoteSession.myReflection && kidsNoteSession.myReflection.stepIndex !== kidsNoteStepIndex) return;
    kidsNoteSyncedRef.current = true;
    console.log('[kids-note-sync]', {
      hasText: !!kidsNoteSession.myReflection?.text,
      text: kidsNoteSession.myReflection?.text?.slice(0, 20),
      stepIndex: kidsNoteSession.myReflection?.stepIndex,
      expectedStep: kidsNoteStepIndex,
      sessionId: kidsNoteSession.sessionId,
    });
    if (kidsNoteSession.myReflection?.text) {
```

Nothing else changes — the rest of the effect, dependencies, and all other code stays as-is.

