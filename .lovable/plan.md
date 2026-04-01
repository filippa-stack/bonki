

## NextActionBanner Layout Shift Fix

### Change (1 file: `src/components/KidsProductHome.tsx`)

**Line 603**: Wrap `NextActionBanner` in a container with reserved height to prevent tile grid jump.

```tsx
// Before
<NextActionBanner product={product} progress={progress} />

// After
<div style={{ minHeight: '52px' }}>
  <NextActionBanner product={product} progress={progress} />
</div>
```

### What stays untouched
- NextActionBanner internals, animations, theme hooks
- Tile rendering, grid layout
- All other files and protected patterns

