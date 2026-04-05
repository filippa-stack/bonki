

## Fix Product Home Double Blink on Reload

**File:** `src/components/KidsProductHome.tsx` — 3 small additions

### 1. Add ref (after existing hooks, ~line 333)
```tsx
const hasRenderedContent = useRef(false);
```
`useRef` is already imported via React.

### 2. Update loading gate (line 349)
```tsx
// FROM:
if (progress.loading) {
// TO:
if (progress.loading && !hasRenderedContent.current) {
```

### 3. Set ref before main return (line 353)
Add `hasRenderedContent.current = true;` immediately before the `return (` of the main JSX.

### 4. Reset on product change (after the ref declaration)
```tsx
useEffect(() => {
  hasRenderedContent.current = false;
}, [product.id]);
```
`useEffect` is already imported.

### Not changed
- Loading gate JSX, progress hook, tiles, banners, any other file

