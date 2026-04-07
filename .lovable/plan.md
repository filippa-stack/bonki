

## Add diagnostic log to kids-note-sync effect

**File:** `src/pages/CardView.tsx` — 1 change (lines 712–722)

### Change

Add a `console.log('[kids-note-sync]', ...)` after setting `kidsNoteSyncedRef.current = true` and before the conditional, matching the user's provided snippet exactly.

**Current (lines 712–722):**
```typescript
useEffect(() => {
    if (kidsNoteSession.loading) return;
    if (kidsNoteSyncedRef.current) return;
    kidsNoteSyncedRef.current = true;
    if (kidsNoteSession.myReflection?.text && kidsNoteSession.myReflection.stepIndex === kidsNoteStepIndex) {
```

**Replace with:**
```typescript
useEffect(() => {
    if (kidsNoteSession.loading) return;
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

Everything else stays unchanged.

