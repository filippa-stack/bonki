

## Capitalize Card Titles in Session Headers & Illustration Pill

Two CSS-only changes — no structural, animation, or mount-logic modifications.

### Changes

**1. `src/components/Header.tsx` — immersive title (line ~123)**
Add `textTransform: 'capitalize'` to the existing style object on the `<h1>` inside the immersive variant. This only affects in-session headers.

**2. `src/components/IllustrationPeek.tsx` — expanded overlay title (line ~131)**
Add `textTransform: 'capitalize'` to the style object on the `<motion.p>` that renders `cardTitle`.

### Why this is flicker-safe
- Both changes are pure CSS property additions to existing inline style objects
- No changes to `initial`, `animate`, `AnimatePresence`, or mount logic
- No changes to component structure, conditional rendering, or state
- IllustrationPeek's `initial={{ opacity: 1, scale: 1 }}` pattern remains untouched

### Files touched
- `src/components/Header.tsx` — 1 line addition
- `src/components/IllustrationPeek.tsx` — 1 line addition

