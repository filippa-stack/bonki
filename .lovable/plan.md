

## Fix Portal Page Flicker on Navigation

**File:** `src/pages/KidsCardPortal.tsx`

`useRef` is already imported (line 11). Four small changes:

### Change 1: Add ref (after existing refs, ~line 50 area)
```tsx
const hasRenderedContent = useRef(false);
```

### Change 2: Update loading gate (line 259)
```tsx
// FROM:
if (progress.loading) {
// TO:
if (progress.loading && !hasRenderedContent.current) {
```

### Change 3: Set ref before main return (line 273)
Add `hasRenderedContent.current = true;` immediately before `return (`.

### Change 4: Reset ref on category change
```tsx
useEffect(() => {
  hasRenderedContent.current = false;
}, [categoryId]);
```

### Not changed
- `useKidsProductProgress` hook, portal content, card navigation, paywall logic, animations, any other file

