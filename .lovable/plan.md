

## Why the pills are different sizes

The "Samtal 1 gratis" pill on kids tiles (Jag i Mig, etc.) stretches to fill its parent width, while the Still Us pill shrinks to fit its text content. This is a CSS layout bug.

**Root cause**: In the `LibraryTile` component (kids tiles), the pill `<span>` is a direct child of a flex-column container (`width: 55%`). In a flex column, children stretch on the cross axis (width) by default. So the `inline-flex` span expands to fill the full 55% width instead of shrinking to content.

In the Still Us tile, the pill is wrapped in an extra `<div style={{ display: 'flex' }}>` container, which prevents the stretch behavior.

### Fix

**File: `src/components/ProductLibrary.tsx`** (~line 389)

Add `alignSelf: 'flex-start'` to the kids tile pill `<span>` style. This overrides the default `stretch` alignment in the flex column, making the pill shrink to its content width — matching the Still Us pill behavior.

```tsx
<span
  style={{
    display: 'inline-flex',
    alignSelf: 'flex-start',   // ← ADD THIS
    alignItems: 'center',
    // ... rest unchanged
  }}
>
```

Single line addition. No other files affected.

