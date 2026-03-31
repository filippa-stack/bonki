

## Fix: Browse Sheet Flicker + Missing X Button (2 of 3)

Issue 2 (back nav change) is rejected — keeping `setShowLeaveConfirm(true)` on the first question to prevent silent data loss.

### Changes — 2 files

**1. `src/pages/KidsCardPortal.tsx`** — GPU compositing hint on browse sheet backdrop
- Add `transform: 'translateZ(0)'` to the PortalBrowseSheet backdrop style to force GPU layer promotion and prevent iOS Safari full-page repaint flicker when the sheet opens.

**2. `src/pages/CardView.tsx`** — Add X close button to Still Us focus mode topSlot
- After the existing back arrow button (~line 2497), add an absolute-positioned X button on the right side of the nav bar.
- `onClick={() => setShowLeaveConfirm(true)}` — triggers the existing pause dialog.
- 44px touch target, `X` icon from lucide-react (size 18, strokeWidth 1.5), colored `LANTERN_GLOW` at 0.5 opacity.
- `aria-label="Stäng samtalet"`.

### What stays unchanged
- Back button on first question still calls `setShowLeaveConfirm(true)` — pause dialog appears, no silent data loss.

