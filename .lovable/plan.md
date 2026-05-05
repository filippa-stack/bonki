## Goal

Match the bottom navigation bar background to the library page background (Midnight Ink).

## Change

In `src/components/BottomNav.tsx`:

- Swap the import: `DEEP_DUSK` → `MIDNIGHT_INK` from `@/lib/palette`.
- Line 79: `background: DEEP_DUSK` → `background: MIDNIGHT_INK` (`#1A1A2E`, the same value `ProductLibrary` uses for `libraryBg`).

Nothing else changes — icons, labels, layout, safe-area padding, active-state styling all preserved.
