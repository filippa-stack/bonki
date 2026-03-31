

## Fix: Two Flicker Sources — PortalBrowseSheet + SessionFocusShell Exit Dialog

### Issue 1: PortalBrowseSheet flickers on open/close

**Root cause**: The always-mounted `motion.div` elements lack `initial={false}`. On first mount (with `open=false`), framer-motion animates from its default state (opacity 1, y 0) to the closed state (opacity 0, y 100%) — causing a visible flash of the backdrop and sheet.

**Fix** — `src/components/PortalBrowseSheet.tsx`:
- Add `initial={false}` to the backdrop `motion.div` (line 83)
- Add `initial={false}` to the sheet `motion.div` (line 98)

This tells framer-motion to skip the mount animation and just render in the current `animate` state immediately.

### Issue 2: Pause confirmation dialog flickers "skriv vad ni vill minnas"

**Root cause**: `SessionFocusShell.tsx` uses `AnimatePresence` with conditional rendering for the exit dialog (lines 203-286). When the dialog mounts, iOS Safari rebuilds the compositing tree, triggering a repaint flash on the session content behind it — same pattern as PortalBrowseSheet before.

**Fix** — `src/components/SessionFocusShell.tsx`:
- Replace the `AnimatePresence` + conditional mount with always-mounted elements
- Backdrop: `animate={{ opacity: showExitDialog ? 1 : 0 }}`, `pointerEvents: showExitDialog ? 'auto' : 'none'`
- Dialog card: `animate={{ opacity: showExitDialog ? 1 : 0, scale: showExitDialog ? 1 : 0.95 }}`, `pointerEvents: showExitDialog ? 'auto' : 'none'`
- Remove `initial`/`exit` props (no longer needed)

### Protected patterns — untouched
No changes to any of the four protected ref patterns.

### Files changed: 2
1. `src/components/PortalBrowseSheet.tsx` — add `initial={false}` to both motion.divs
2. `src/components/SessionFocusShell.tsx` — replace AnimatePresence conditional with always-mounted pattern

