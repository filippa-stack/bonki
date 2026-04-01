

## CardView Loading Gate Flash Fix

### Changes (1 file: `src/pages/CardView.tsx`)

**Change 1: Always suppress entry animations (line 123)**

The loading gate already provides the visual bridge — entry animations after it resolves are redundant and cause the flash.

```tsx
// Before
const [suppressEntryAnim] = useState(() => isResumed);

// After
const [suppressEntryAnim] = useState(true);
```

**Change 2: GPU pre-promote the loading gate div (lines 1057–1067)**

Add `willChange`, `WebkitBackfaceVisibility`, and `backfaceVisibility` to the loading gate div to prevent compositor repaints on transition:

```tsx
style={{
  position: 'fixed',
  inset: 0,
  backgroundColor: loadingBg,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10,
  willChange: 'opacity',
  WebkitBackfaceVisibility: 'hidden',
  backfaceVisibility: 'hidden',
}}
```

### What stays untouched
- All hook calls, theme hooks, AnimatePresence config
- Loading gate condition logic
- Session creation/resume logic
- All protected patterns (suppressUntilRef, prevServerStepRef, etc.)
- No other files modified

