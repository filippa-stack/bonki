

## Fix: Remove `bonki-first-session-done` from intro initializer

**File:** `src/pages/ProductHome.tsx`

**Change:** Replace the synchronous localStorage check in `useState` with a simple `true` default:

```tsx
// Before (line ~40):
const [showIntro, setShowIntro] = useState(() => {
  const hasFinishedBefore = localStorage.getItem('bonki-first-session-done');
  return !hasFinishedBefore;
});

// After:
const [showIntro, setShowIntro] = useState(true);
```

The existing `useEffect` already reconciles with the DB result — if `needsIntro` is `false`, it flips `showIntro` to `false`. No other files touched.

