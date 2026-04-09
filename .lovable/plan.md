

## Eliminate Illustration Flicker in KidsCardPortal

Four surgical edits across two files. No routes, session logic, AnimatePresence modes, or other files modified.

---

### File 1: `src/pages/KidsCardPortal.tsx`

**Edit A — Preload adjacent cards (insert after line 137)**

Add a `useEffect` that creates `new Image()` for `categoryCards[currentIndex - 1]` and `categoryCards[currentIndex + 1]`, warming the browser cache before the user swipes.

**Edit B — Smart cache detection (replace line 140)**

Replace `useEffect(() => { setImageLoaded(false); }, [card?.id])` with a version that creates a test `Image`, checks `testImg.complete`, and only resets `imageLoaded` to `false` if the image isn't already cached.

**Edit C — Synchronous decoding (modify line ~451)**

Add `decoding="sync"` to the `<img>` tag inside the `PortalCardImage` render prop, forcing same-frame paint.

---

### File 2: `src/components/KidsProductHome.tsx`

**Edit D — Preload first portal card per category (insert after line 353)**

Add a `useEffect` keyed on `tileImages` that loops through and creates `new Image()` for each `/card-images/${id}.webp`, so images are warm before the user taps into any portal.

---

### What this achieves

When viewing card N, cards N-1 and N+1 are already fetched. On swipe, `testImg.complete` returns `true` → no opacity fade → `decoding="sync"` paints on the same frame → zero flicker. And from the product home, the first card in each category is pre-cached before the user even taps a tile.

