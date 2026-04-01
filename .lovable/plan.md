

## Overlay Compositing — GPU Pre-promotion for iOS Safari

### Problem
iOS Safari flashes a single frame when `position: fixed` overlay elements mount with opacity animations, due to GPU layer creation timing.

### Fix
Add `willChange: 'opacity'`, `backfaceVisibility: 'hidden'`, `WebkitBackfaceVisibility: 'hidden'` to overlay containers in 5 files. Style props coexist alongside existing `className`/`cn()` — no Tailwind classes moved.

### Changes

**1. `src/components/IllustrationPeek.tsx`**
Merge three properties into the fullscreen overlay `motion.div` style object (~line 68, the one with `position: 'fixed', inset: 0`).

**2. `src/components/PortalBrowseSheet.tsx`**
On the sheet `motion.div` (~line 115): change `willChange: 'transform'` to `willChange: 'transform, opacity'`, add `backfaceVisibility: 'hidden'` and `WebkitBackfaceVisibility: 'hidden'`. No `translateZ(0)`.

**3. `src/components/ui/alert-dialog.tsx`**
Add `style={{ willChange: 'opacity', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}` to both `AlertDialogOverlay` and `AlertDialogContent` elements, placed before `{...props}`.

**4. `src/components/ui/dialog.tsx`**
Same `style` prop added to `DialogOverlay` and `DialogContent`, before `{...props}`.

**5. `src/components/ui/sheet.tsx`**
Same `style` prop added to `SheetOverlay` and `SheetContent`, before `{...props}`.

### Constraints
- `className` and `cn()` untouched
- No animation durations/easing/AnimatePresence changes
- No `transform: translateZ(0)` on transform-animated elements
- No other files modified

