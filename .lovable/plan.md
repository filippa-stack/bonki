

## Fix: Still Us Session Pause Dialog Flicker

### Root cause
The exit dialog in `SessionFocusShell.tsx` is correctly always-mounted with `initial={false}`, but both the backdrop and dialog card `motion.div` elements lack `willChange` CSS hints. When the opacity animates from 0→1, iOS Safari promotes these elements to GPU layers on-the-fly, causing a compositing tree rebuild that flashes the content behind the dialog.

Additionally, in `CardView.tsx` line 2449, the `SessionFocusShell` has `key={`focus-${currentStepIndex}`}` which **remounts the entire shell** (including the always-mounted dialog) on every step change — undoing the always-mounted pattern for any subsequent step.

### Fix — 2 files

**1. `src/components/SessionFocusShell.tsx`**
- Backdrop `motion.div` (line 207 style): add `willChange: 'opacity'`
- Dialog card `motion.div` (line 224 style): add `willChange: 'opacity, transform'`

**2. `src/pages/CardView.tsx`**
- Line 2449: Remove the `key={`focus-${currentStepIndex}`}` prop from SessionFocusShell. This key causes full remount on step change, destroying the always-mounted dialog and re-creating it — triggering iOS repaint. The step transition is already handled by the `AnimatePresence` inside the shell's children.

### Protected patterns — untouched
No changes to any of the four protected ref patterns (`suppressUntilRef`, `prevServerStepRef`, `pendingSave`, `hasSyncedRef`).

