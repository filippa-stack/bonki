

## Fix: PortalBrowseSheet Flicker on Open/Close

### Root cause
When the browse sheet opens, iOS Safari triggers a repaint of the page behind the fixed overlay. The backdrop fade-in (`opacity: 0 → 1`) combined with the page content creates a visible flash. On close, the reverse happens — the backdrop fading out reveals a brief content repaint.

### Fix — 1 file

**`src/components/PortalBrowseSheet.tsx`**

1. **Prevent body scroll while sheet is open** — Add a `useEffect` that sets `document.body.style.overflow = 'hidden'` when `open` is true and restores it on close. This prevents iOS Safari from recalculating scroll position during the overlay transition.

2. **Use `will-change: opacity` on the backdrop** — Promotes the backdrop to its own compositor layer, preventing full-page repaint during the fade animation.

3. **Use `will-change: transform` on the sheet** — Same compositor promotion for the slide animation.

### Technical detail

```tsx
// Add inside PortalBrowseSheet component body:
useEffect(() => {
  if (open) {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }
}, [open]);
```

On the backdrop `motion.div` (line 78), add `willChange: 'opacity'` to its style.
On the sheet `motion.div` (line 93), add `willChange: 'transform'` to its style.

### Protected patterns — untouched
No changes to any protected ref patterns.

