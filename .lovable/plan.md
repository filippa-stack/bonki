

## IllustrationPeek: Remove backdrop-filter flicker

### Problem
`backdropFilter: 'blur(16px)'` and `WebkitBackdropFilter: 'blur(16px)'` on the fullscreen overlay trigger an expensive GPU composition at mount time (opacity: 0 → 1), causing a visible frame drop on iOS Safari.

### Change (1 file)

**`src/components/IllustrationPeek.tsx`** — Remove two lines from the overlay style object (~lines 78, 82):
- Delete `backdropFilter: 'blur(16px)',`
- Delete `WebkitBackdropFilter: 'blur(16px)',`

The overlay already uses a solid `productBgColor` background, so the blur adds no visual value.

### What stays untouched
- `AnimatePresence`, `initial`/`animate`/`exit` props
- `willChange: 'opacity'`, `backfaceVisibility`/`WebkitBackfaceVisibility`
- All other styles, layout, and animation timing
- All protected patterns (`suppressUntilRef`, `prevServerStepRef`, `clearTimeout`, `hasSyncedRef`)

