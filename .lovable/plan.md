

## Fix Back-to-Last-Question Landing on First Question

**File:** `src/pages/CardView.tsx`, line 579

### Change

Add `&& !userDismissedCompletion.current` to the reset condition:

```tsx
// Line 579
if ((sessionChanged || stepAdvanced) && !userDismissedCompletion.current) {
```

One line changed. The `userDismissedCompletion` ref already exists from the previous fix.

### Not changed
- `prevServerStepRef.current` / `prevSessionIdRef.current` updates
- Föregående handlers, suppressUntilRef, any other file

