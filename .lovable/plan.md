

## Fix: Title Cut-Off + Bottom Gap (Take 2)

The previous fix didn't fully resolve the issues. Root causes:

### 1. Title still cut off
`paddingTop: clamp(56px, 12vh, 100px)` doesn't account for the iOS safe-area inset. The back button sits at `top: env(safe-area-inset-top)`, so content must clear both the safe area AND the back button.

**Fix**: Change paddingTop to `calc(env(safe-area-inset-top, 0px) + 56px)` — this guarantees the title sits below the back button on all devices.

### 2. Bottom gap too large
`paddingBottom: calc(72px + env(safe-area-inset-bottom, 0px))` reserves 72px + safe area, but this is excessive. The BottomNav is ~56px and already handles its own safe-area padding.

**Fix**: Reduce to `calc(56px + env(safe-area-inset-bottom, 0px))` to match the actual BottomNav height with minimal breathing room.

### 3. Outer container uses `min-h-screen`
Per the iOS Safari memory, `100dvh` is prohibited but `min-h-screen` (which maps to `100vh` in Tailwind) can also cause issues. The content should just flow naturally.

**Fix**: Change outer div from `className="min-h-screen ..."` to use `min-height: 100vh` explicitly (same thing, just confirming it's correct per policy).

### Changes — single file: `src/components/KidsProductHome.tsx`

| Line | Current | New |
|------|---------|-----|
| 547 | `paddingTop: 'clamp(56px, 12vh, 100px)'` | `paddingTop: 'calc(env(safe-area-inset-top, 0px) + 56px)'` |
| 549 | `paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))'` | `paddingBottom: 'calc(56px + env(safe-area-inset-bottom, 0px))'` |

Two line changes, same file. No structural or behavioral changes.

