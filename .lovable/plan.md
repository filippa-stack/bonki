

## Fix: BottomNav Overlap on Still Us Pages

### Problem

Still Us uses two page components — `KidsProductHome.tsx` (shared product home) and `StillUsExplore.tsx` (the "Alla ämnen" browse page). Both have insufficient bottom spacing, causing content to hide behind the 56px BottomNav.

### Analysis

1. **KidsProductHome.tsx** (line 628): The category grid uses `marginBottom: '10vh'` — on a short viewport (e.g. iPhone SE, 667px), that's only ~67px. With the BottomNav (56px) + safe area, content can still be clipped. Should use the standard bottom spacing rule: `calc(72px + env(safe-area-inset-bottom, 0px))`.

2. **StillUsExplore.tsx** (line 107): Uses `padding: '24px 16px 120px'` — hardcoded 120px. This is generous but doesn't account for safe-area-inset-bottom on notched iPhones. Should also use the standard formula.

### Changes — 2 files

**1. `src/components/KidsProductHome.tsx` (line 628)**
- Change `marginBottom: '10vh'` → `marginBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))'`
- This applies to all products using this component (kids products + Still Us)

**2. `src/pages/StillUsExplore.tsx` (line 107)**
- Change `padding: '24px 16px 120px'` → `padding: '24px 16px calc(72px + env(safe-area-inset-bottom, 0px))'`
- Aligns with the codebase's standard BottomNav spacing rule

### Why this works

Both changes follow the documented spacing rule from the codebase convention: 56px nav + 16px breathing room + safe-area inset. This ensures the last tile/card and any sign-off text are fully visible above the BottomNav on all iPhone models.

### Files changed: 2
- `src/components/KidsProductHome.tsx`
- `src/pages/StillUsExplore.tsx`

