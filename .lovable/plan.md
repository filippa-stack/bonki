

## Fix: Card illustration double-slide on browse sheet selection

### Root cause

In `KidsCardPortal.tsx` (line 379–387), every card change triggers the `slideVariants` animation via `AnimatePresence mode="wait"`. This makes sense for swipe navigation (directional slide), but when selecting a card from the `PortalBrowseSheet`, the animation is jarring — the old card slides out and the new one slides in unnecessarily.

### Fix

**File: `src/pages/KidsCardPortal.tsx`**

1. Add a ref to track whether the card change came from the browse sheet:
   ```ts
   const fromBrowse = useRef(false);
   ```

2. In the `goToIndex` callback (used by browse sheet), set the flag:
   ```ts
   const goToIndex = useCallback((index: number) => {
     fromBrowse.current = true;
     setDirection(index > currentIndex ? 1 : -1);
     setCurrentIndex(index);
   }, [currentIndex]);
   ```

3. Reset the flag after the card renders, via an effect:
   ```ts
   useEffect(() => { fromBrowse.current = false; }, [card?.id]);
   ```

4. On the `motion.div` (line 380–387), conditionally disable animation when coming from the browse sheet:
   ```tsx
   <motion.div
     key={card.id}
     custom={direction}
     variants={slideVariants}
     initial={fromBrowse.current ? "center" : false}
     animate="center"
     exit={fromBrowse.current ? "center" : "exit"}
     transition={{ duration: fromBrowse.current ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
     ...
   ```

   When `fromBrowse` is true: `initial="center"`, `exit="center"`, and `duration: 0` — the new card appears instantly with no slide. When false (swipe/arrow): normal directional slide animation.

### Files changed
- `src/pages/KidsCardPortal.tsx` — add `fromBrowse` ref, update `goToIndex`, adjust motion props

### No other files changed
`PortalBrowseSheet.tsx`, `App.tsx`, and route-level `AnimatePresence` are untouched.

