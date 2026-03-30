

## Plan: Update PageTransition.tsx with touch-device-aware animation

### Summary
Replace the entire content of `src/components/PageTransition.tsx` with the user-provided code that adds a module-level `isTouchDevice` constant and conditionally disables Framer Motion opacity animations on touch devices.

### Single file change
**`src/components/PageTransition.tsx`** — full file replacement with the provided code. Key differences from current version:
- Add `isTouchDevice` constant using `(hover: none) and (pointer: coarse)` media query
- `initial`: `false` on touch, `{ opacity: 0 }` on desktop
- `exit`: `{ opacity: 1 }` on touch, `{ opacity: 0 }` on desktop
- `transition`: `{ duration: 0 }` on touch, original card-route easing on desktop
- Keep `minHeight: '100vh'` (not `100dvh`)
- Keep `page-transition` className

No other files modified.

