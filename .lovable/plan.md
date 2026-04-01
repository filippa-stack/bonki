

## Fix: Title Cut-Off + Bottom Gap on All 7 Product Home Screens

All seven products route through `KidsProductHome.tsx`, so these three changes fix every product home screen.

### Changes — `src/components/KidsProductHome.tsx`

| # | What | Why |
|---|------|-----|
| 1 | Increase content `paddingTop` from `clamp(32px, 10vh, 90px)` → `clamp(56px, 12vh, 100px)` | Title currently renders behind status bar / back button |
| 2 | Remove `flex: 1` spacer + the 8px spacer below it; replace with a fixed `16px` div | Unbounded flex pushes tiles too far down on tall screens |
| 3 | Remove `marginBottom: calc(72px + safe-area)` from the grid container | Content wrapper already has that same `paddingBottom` — double clearance creates the bottom gap |

No other files affected. Pure layout fix, no behavioral changes.

