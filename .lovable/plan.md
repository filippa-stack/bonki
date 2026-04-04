

## Fix Journal Empty State Flash on Reload

**File:** `src/pages/Journal.tsx` — 3 small additions

### Change 1: Add ref (near existing refs/state)
Add `const hasRenderedContent = useRef(false);` near other ref declarations.

### Change 2: Guard empty state condition
Change `isEmpty ?` to `(isEmpty && !hasRenderedContent.current) ?` so once content has rendered, the empty state never flashes again.

### Change 3: Set ref when content renders
Before the `monthGroups.map(...)` block, add `hasRenderedContent.current = true;` so the ref is set as soon as real timeline content is displayed.

### Not changed
- Loading skeleton, empty state content, data fetching, any other file

