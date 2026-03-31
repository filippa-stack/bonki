

## Fix: Still Us Pause Dialog Flicker

### Root cause
Two dialogs render simultaneously from the same `showLeaveConfirm` state:
1. SessionFocusShell's `motion.div` dialog (lines 202–283) — framer-motion opacity/scale animation
2. A Radix AlertDialog in CardView.tsx (lines 2993–3027) — portaled to body

Both open and close together, creating visible double-flash on iOS Safari.

### Fix — 2 files

**1. `src/components/SessionFocusShell.tsx`** — Replace the motion.div dialog (lines 202–283) with a Radix AlertDialog:

```tsx
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from '@/components/ui/alert-dialog';
```

Replace lines 202–283 with:
```tsx
<AlertDialog open={showExitDialog} onOpenChange={(open) => { if (!open) onExitDialogClose?.(); }}>
  <AlertDialogContent style={{ backgroundColor: EMBER_GLOW, borderRadius: '16px', border: 'none' }}>
    <AlertDialogHeader>
      <AlertDialogTitle style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: BARK, textAlign: 'center' }}>
        Pausa samtalet?
      </AlertDialogTitle>
    </AlertDialogHeader>
    <AlertDialogFooter style={{ flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
      <AlertDialogAction onClick={onExitConfirm} style={{
        backgroundColor: DEEP_SAFFRON, color: MIDNIGHT_INK, borderRadius: '12px', height: '48px',
      }}>
        Ja, pausa
      </AlertDialogAction>
      <AlertDialogCancel onClick={onExitDialogClose} style={{
        background: 'none', border: 'none', color: DRIFTWOOD, fontSize: '14px',
      }}>
        Fortsätt
      </AlertDialogCancel>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

Dismissal coverage:
- "Fortsätt" → `AlertDialogCancel` calls `onExitDialogClose` via both `onClick` and `onOpenChange(false)`
- Escape key / outside tap → `onOpenChange(false)` → `onExitDialogClose`
- "Ja, pausa" → `AlertDialogAction` `onClick` → `onExitConfirm` → calls `handleSmartExit()`

**2. `src/pages/CardView.tsx`** — Delete the duplicate AlertDialog block (lines 2993–3027). SessionFocusShell now owns the dialog exclusively.

### Protected patterns — untouched
No changes to `suppressUntilRef`, `prevServerStepRef`, `pendingSave`, or `hasSyncedRef`.

### Files changed: 2

