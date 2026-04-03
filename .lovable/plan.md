

## Fix Still Us Session — Minimal Safe Changes Only

**File:** `src/pages/CardView.tsx` — 3 changes in the `isStillUsFocusMode` block

### Change 1: Remove dark scrim overlay
Delete the scrim `<div>` (the one with `backgroundColor: 'rgba(0, 0, 0, 0.25)'`). Kids sessions have no scrim.

### Change 2: Illustration opacity
`opacity: 0.35` → `opacity: 0.7` — matching Kids exactly.

### Change 3: White card padding
`padding: '12px 0 4px'` → `padding: '28px 24px 20px'` — matching Kids card spacing.

### NOT changed
- SectionView rendering (stays as-is)
- Note nudge position (stays in CTA zone)
- Header layout (stays as-is)
- Advance/back handlers, completion logic, AnimatePresence
- Any other file

