## Hotfix: Allow textarea to clear on prompt advance (with diagnostic log + comment retained)

### File
`src/pages/CardView.tsx` only.

### Change
1. Delete L805:
   ```ts
   if (!kidsNoteSession.myReflection && kidsNoteSession.sessionId) return;
   ```
2. Replace the existing one-line comment above the sync effect (currently L800: `// Sync saved note text from DB — only on initial load for each prompt`) with the rationale block below.
3. **Keep** the `[kids-note-sync]` `console.log` exactly as-is — it is the remote diagnostic for this code path.
4. **Keep** the loading guard (L802), synced-ref guard (L803), and stale-prompt guard (L804) untouched.

### Resulting region (current L800–820)
```ts
// Sync saved note text from DB on prompt change.
// The loading guard below is sufficient — useSessionReflections sets loading=true
// synchronously when (sessionId, stepIndex) change, batched with setMyReflection(null),
// so there is no observable render where loading=false && myReflection=null && sessionId=valid
// during a fetch. The only time that triple-state occurs is AFTER the fetch resolves with
// no row, which is exactly when we want to clear local text. Do NOT re-add a
// `!myReflection && sessionId` early-return here — it reintroduces the Q2→Q3 carry-over bug.
useEffect(() => {
  if (kidsNoteSession.loading) return;
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
    setKidsNoteLocalText(kidsNoteSession.myReflection.text);
    setKidsNoteExpanded(true);
  } else {
    setKidsNoteLocalText('');
  }
}, [kidsNoteSession.loading, kidsNoteSession.myReflection, kidsNoteStepIndex]);
```

### Untouched
- Reset effect (793–798)
- All write paths, recovery effects, session id derivation, autosave, markReady
- `useSessionReflections.ts` (no edits)
- No other files touched

### Verification (iOS preview)
1. Q2: type "Jwhavs" → tap Fortsätt
2. Q3 textarea is empty (collapsed with pencil nudge)
3. Type something on Q3 → Fortsätt → Q4 also empty
4. Back to Q2 → "Jwhavs" reappears
5. Confirm `[kids-note-sync]` console log fires on every prompt transition with `hasText`: false on Q3/Q4 first visit, true on Q2 return.
6. Paste the updated L800–820 region in the closing message for audit before Live publish.
