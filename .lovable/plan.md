

## Fix Double Flicker on First Session Start

**File:** `src/pages/CardView.tsx`

### Problem
Eager session creation triggers `normalizedSession.refetch()`, which sets `loading` back to `true`, causing the loading gate to flash a second time after content has already rendered.

### Changes

**1. Add ref** (near line 430, next to `eagerSessionRef`):
```tsx
const hasRenderedContent = useRef(false);
```

**2. Reset ref on card change** (line 431-433, existing `useEffect`):
```tsx
useEffect(() => {
  eagerSessionRef.current = false;
  hasRenderedContent.current = false;
}, [cardId]);
```

**3. Update loading gate condition** (line 1073):
```tsx
if (isInitializing && !devState && !showCompletion && !hasRenderedContent.current) {
```

**4. Set ref before content returns** — add `hasRenderedContent.current = true;` before each content return:
- Before the completion return for kids (~line 1167)
- Before the completion return for Still Us (~line 1444)
- Before the Still Us focus mode return (~line 2523, after `if (isStillUsFocusMode && currentSection)`)
- Before the final return (the kids live session, end of file ~line 4085)
- Before the archive mode return (~line 2362)

### Not changed
- `isInitializing` computation
- Loading gate JSX
- Eager session creation logic
- `normalizedSession.refetch()` calls
- Any suppression refs, AnimatePresence, or other files

