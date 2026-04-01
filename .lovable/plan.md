

## Fix: Keep kids product reflections visible during active session

### Changes (1 file: `src/pages/CardView.tsx`)

**Change 1: Simplify the prompt-change reset effect (lines 631–639)**

Remove the suppress window. Replace with:

```tsx
// Reset note UI when prompt changes — allow immediate DB sync
useEffect(() => {
  setKidsNoteExpanded(false);
  setKidsNoteLocalText('');
  kidsNoteInteractedRef.current = false;
}, [localPromptIndex]);
```

Delete the `kidsNoteSuppressSyncRef` ref declaration (line 629) entirely.

**Change 2: Update the sync effect to restore immediately (lines 641–649)**

Replace with:

```tsx
// Sync saved note text from DB — restore immediately when data arrives for new step
useEffect(() => {
  if (kidsNoteSession.loading) return;
  if (kidsNoteSession.myReflection?.text) {
    setKidsNoteLocalText(kidsNoteSession.myReflection.text);
    setKidsNoteExpanded(true);
  }
}, [kidsNoteSession.loading, kidsNoteSession.myReflection?.text, kidsNoteStepIndex]);
```

Key difference: removed the `kidsNoteSuppressSyncRef.current` guard and added `kidsNoteSession.myReflection?.text` to deps so it fires when reflection data arrives, not just when loading toggles.

### What stays untouched
- All protected patterns (suppressUntilRef, prevServerStepRef, clearTimeout/pendingSave, hasSyncedRef)
- Resume logic block, AnimatePresence mode, handleKidsAdvance/Back, completion logic
- useSessionReflections, SessionStepReflection, LockedReflectionDisplay, useNormalizedSessionState
- Still Us logic, archive/completion rendering, CSS/animations

