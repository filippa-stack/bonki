# Fix: KontoSheet "Radera konto" hidden behind BottomNav

## Confirmed bug

On iPhone 17 Pro Simulator, on pages that render `BottomNav` (Library, Journal), the Konto sheet extends below the BottomNav, so "Radera konto" is occluded by the nav bar (56px + safe-area-inset-bottom). On pages without BottomNav (ProductHome) the row is visible.

## Single change: `src/components/KontoSheet.tsx`

The sheet container at lines 124–132 currently has no max-height, no scroll, and only pads `safe-area-inset-bottom`. Replace with a scrollable container that also reserves room for the BottomNav.

```tsx
{/* Sheet */}
<div
  className="absolute bottom-0 left-0 right-0"
  style={{
    backgroundColor: '#F7F2EB',
    borderRadius: '16px 16px 0 0',
    // Cap height so destructive actions (Radera konto) cannot hide
    // behind safe-area or the BottomNav.
    // Per mem://design/layout/ios-safari-stability: 100vh, not 100dvh.
    maxHeight: 'calc(100vh - 32px)',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    overscrollBehavior: 'contain',
    // Reserve space for BottomNav (56px) + safe-area-inset-bottom,
    // so the last row scrolls clear of the nav on Library/Journal.
    paddingBottom:
      'calc(56px + max(env(safe-area-inset-bottom, 0px), 16px))',
  }}
  onClick={(e) => e.stopPropagation()}
>
```

### Why these values

- `maxHeight: calc(100vh - 32px)` — leaves a small backdrop strip at top so users can tap to dismiss; respects iOS Safari stability rule (100vh, not 100dvh).
- `overflowY: auto` + `WebkitOverflowScrolling: touch` — momentum scroll inside the sheet on iOS.
- `overscrollBehavior: contain` — prevents body bounce/rubber-band leaking through the backdrop.
- `paddingBottom: calc(56px + max(env(safe-area-inset-bottom), 16px))` — BottomNav is 56px tall (verified in `src/components/BottomNav.tsx:88`) and itself adds safe-area-inset-bottom (line 77). Mirroring that here ensures the last row always scrolls clear of the nav, on every page, regardless of whether BottomNav is rendered (harmless ~88px gap on pages without it, which is acceptable for a sheet).

## Out of scope

- No changes to host pages, no changes to BottomNav, no changes to delete-account function.
- No layout changes to the delete-confirmation Dialog (portaled outside the sheet, unaffected).

## After ship — your one-time step on Mac

```bash
git pull
npm run build
npx cap sync ios
```

Then in Xcode: Product → Clean Build Folder → Run on Simulator.

## Verification

1. From `/journal` or library, open Konto sheet
2. Confirm sheet is scrollable and "Radera konto" is reachable above the BottomNav
3. From `/product/jag-i-mig` (no BottomNav), confirm sheet still looks correct (just has extra bottom padding, no clipping)
4. Tap "Radera konto" → confirmation dialog opens unchanged
