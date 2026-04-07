

## Fix: Add null-reflection guard to sync effect

**File:** `src/pages/CardView.tsx` — line 715

**Change:** Insert one guard line after the stale-data check (line 715), before setting `kidsNoteSyncedRef.current = true`.

```typescript
// Line 715 (existing):
if (kidsNoteSession.myReflection && kidsNoteSession.myReflection.stepIndex !== kidsNoteStepIndex) return;
// NEW line 716:
if (!kidsNoteSession.myReflection && kidsNoteSession.sessionId) return;
// Then existing line 716 continues:
kidsNoteSyncedRef.current = true;
```

This single added line prevents the sync effect from finalizing (and clearing text) when `myReflection` is null but a session exists (fetch still in flight). The effect will re-trigger when the fetch completes and `myReflection` updates.

Nothing else in this effect or file changes.

