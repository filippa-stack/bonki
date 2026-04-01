

## Fix handleSmartExit: Remove Session Completion on Pause

### Change (1 file: `src/pages/CardView.tsx`)

Replace `handleSmartExit` (~lines 2427–2453) with simplified version:

- **Remove** the `handleCompleteStep()` call — pause must never complete a session
- **Remove** unused variables (`displayIndex`, `isLastStep`, `section`, `prompts`, `totalPrompts`, `isLastPrompt`)
- **Move** kids note save outside the last-step conditional — notes are preserved on any pause, not just at the final prompt
- **Keep** `setShowLeaveConfirm(false)` and `setTimeout(() => navigate(exitBackTo), 250)` unchanged

### Result
```tsx
// Pause exit: save any pending note but never complete the session
const handleSmartExit = async () => {
  if (isKidsProduct && kidsNoteLocalText.trim()) {
    await kidsNoteSession.markReady(kidsNoteLocalText);
    if (isLocalPreviewMode && product) {
      upsertDemoDiaryEntry({
        productId: product.id,
        cardId: card.id,
        text: kidsNoteLocalText,
        entryKey: `step-${currentStepIndex}-prompt-${localPromptIndex}`,
        mode: 'append',
      });
    }
  }
  setShowLeaveConfirm(false);
  setTimeout(() => navigate(exitBackTo), 250);
};
```

### What stays untouched
- `handleCompleteStep` function itself
- `handleKidsAdvance`, `handleFocusAdvance`
- All protected patterns (suppressUntilRef, prevServerStepRef, clearTimeout, hasSyncedRef)
- AnimatePresence mode attributes, Routes keys, no 100dvh

