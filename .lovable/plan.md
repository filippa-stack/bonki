

## Fix Empty Space Gap on All 7 Product Home Pages

### Root cause
Every product home has a content wrapper with `minHeight: '100vh'` inside an outer `min-h-screen` container. The inner `100vh` + flex layout pushes content apart, creating a visible gap between tiles and bottom nav on devices where content doesn't fill the viewport.

### Fix
Remove `minHeight: '100vh'` from the inner content div in all 7 files. The outer `min-h-screen` already guarantees full-viewport background coverage. Also remove unbounded `flex: 1` spacers that push tiles to the bottom edge.

### Files and changes

| # | File | Change |
|---|---|---|
| 1 | `JagIMigProductHome.tsx` (line 77) | Remove `minHeight: '100vh'` from content div style |
| 2 | `JagMedAndraProductHome.tsx` (line 75) | Remove `minHeight: '100vh'` from content div style |
| 3 | `JagIVarldenProductHome.tsx` (line 69) | Remove `minHeight: '100vh'` from content div style |
| 4 | `JagIVarldenProductHome.tsx` (line 101) | Remove `<div style={{ flex: 1 }} />` spacer |
| 5 | `VardagProductHome.tsx` (line 77) | Remove `minHeight: '100vh'` from content div style |
| 6 | `SyskonProductHome.tsx` (line 74) | Remove `minHeight: '100vh'` from content div style |
| 7 | `SexualitetProductHome.tsx` (line 76) | Remove `minHeight: '100vh'` from content div style |
| 8 | `KidsProductHome.tsx` (line 545) | Remove `minHeight: '100vh'` from content div style |

### What stays unchanged
- Outer `min-h-screen` on the background div (ensures full-viewport color)
- All `paddingBottom` values with `env(safe-area-inset-bottom)` (iPhone fix)
- Bounded spacers with `maxHeight` (Vardag, Syskon, Sexualitet) — these are fine
- No animation, mount logic, or structural changes

### Risk: minimal
Pure CSS removal. Background coverage is handled by parent. Content flows naturally upward.

