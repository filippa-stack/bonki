

## Fix: Title Cut-Off + Bottom Gap (Take 3)

The previous attempts failed because:
1. **Title cut off**: `calc(env(safe-area-inset-top, 0px) + 56px)` evaluates to only ~56px in non-iOS contexts, which is less than the previous `clamp(56px, 12vh, 100px)`. The title gets pushed behind the hero image.
2. **Bottom gap**: `calc(56px + env(safe-area-inset-bottom))` is still too much — the memory spec says 72px but that created gaps. The real fix is minimal padding since BottomNav is fixed/absolute.

### Changes — `src/components/KidsProductHome.tsx`

| # | Line | Current | New | Why |
|---|------|---------|-----|-----|
| 1 | 547 | `paddingTop: 'calc(env(safe-area-inset-top, 0px) + 56px)'` | `paddingTop: 'max(calc(env(safe-area-inset-top, 0px) + 56px), clamp(56px, 12vh, 100px))'` | Takes the larger of safe-area-aware value OR viewport-relative value — title never clips on any device |
| 2 | 549 | `paddingBottom: 'calc(56px + env(safe-area-inset-bottom, 0px))'` | `paddingBottom: '16px'` | BottomNav is fixed-position and handles its own safe-area. Content just needs a small breathing gap, not a full nav-height reservation |

Two line changes. No structural changes.

