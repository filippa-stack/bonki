

## Fix: PortalBrowseSheet Persistent Flicker

### Root cause
The `AnimatePresence` conditional (`{open && ...}`) mounts/unmounts the backdrop and sheet DOM nodes on every open/close. On iOS Safari, this DOM insertion triggers a full compositing tree rebuild, causing a visible flash — even with `will-change` hints.

### Fix — 1 file

**`src/components/PortalBrowseSheet.tsx`**

Replace conditional mount (`{open && ...}`) with always-mounted elements that toggle visibility via `pointerEvents` and `opacity`/`translateY`. This avoids DOM insertion entirely.

1. Remove `AnimatePresence` wrapper and the `{open && ...}` conditional.
2. Keep both backdrop and sheet always in the DOM.
3. Backdrop: animate opacity 0↔1, set `pointerEvents: open ? 'auto' : 'none'`.
4. Sheet: animate y from `100%` ↔ `0`, set `pointerEvents: open ? 'auto' : 'none'`.
5. Use `animate` prop driven by `open` boolean instead of `initial`/`exit`.
6. Keep existing scroll lock `useEffect`, `willChange` hints, drag gesture, and all card rendering logic unchanged.

### Technical detail

```tsx
// No AnimatePresence, no conditional render
<>
  <motion.div
    animate={{ opacity: open ? 1 : 0 }}
    transition={{ duration: 0.25 }}
    onClick={onClose}
    style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.5)',
      willChange: 'opacity',
      pointerEvents: open ? 'auto' : 'none',
      zIndex: 100,
    }}
  />
  <motion.div
    animate={{ y: open ? 0 : '100%' }}
    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      maxHeight: '60vh',
      background: DEEP_DUSK,
      // ...existing styles...
      willChange: 'transform',
      pointerEvents: open ? 'auto' : 'none',
      zIndex: 101,
    }}
  >
    {/* ...existing drag, handle, card list — unchanged */}
  </motion.div>
</>
```

### Protected patterns — untouched
No changes to any protected ref patterns.

