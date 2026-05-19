# Compact LibraryResumeCard visual refresh

Replace only the JSX return block in `src/components/LibraryResumeCard.tsx`. All data fetching, realtime, demo sync, refs, state, and imports stay untouched.

## Scope

**File:** `src/components/LibraryResumeCard.tsx`
**Modify:** only the final `return ( ... )` block (currently the `<div>` wrapper containing the "Fortsätt" eyebrow + button).
**Leave intact:** imports, props interface, `fetchFromDb`, all `useEffect`s, `devMock`/`showMock`, `fetchRef`, `setResume`, `stepLabel` calculation, `useCardImage`, channel cleanup, `if (!display) return null` guard, and all derived constants (`accent`, `isStillUs`, `innerColor`, `darkText`, `illustration`).

## New visual

- Single `<button>` (the whole banner is the action) — no outer `<div>`, no eyebrow label.
- Layout: `[ring + medallion]  [card title]  [chevron]`, gap 12px, padding 11/13, radius 14, subtle accent-tinted bg + border.
- Ring: 46×46 SVG, saffron `#E9B44C` stroke, rotated -90°. Progress parsed visually from `display.stepLabel` via `/(\d+)\s*av\s*(\d+)/` — purely cosmetic, does not alter the data-layer format.
- Medallion: circular for Vårt Vi (uses `ILLUSTRATIONS.still_us` with drop shadow); rounded-square inner panel for kids (uses `innerColor` + `illustration`).
- Title: `display.cardTitle` only, single line, ellipsis. No product name, no "Pausad vid Fråga X av Y".
- Chevron: lucide `ChevronRight`, size 20, colored with `accent`.

## Verification

- TypeScript build clean.
- Tap still navigates to `/card/{display.cardId}`.
- Realtime pause/resume from another device still updates the banner (fetch logic untouched).
- Both Vårt Vi (circle) and kids (rounded square) medallion variants render.
- No "FORTSÄTT" eyebrow, no step label text, no product name in the rendered output.

## Out of scope

All other files; `fetchFromDb`; realtime subscription; the underlying `stepLabel` string format (only parsed for the ring).
