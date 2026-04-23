

## Nudge Vårt Vi tile illustration down to uncrop the brown-hair figure

The right figure's head is currently kissing the top frame. Pulling the illustration down ~6% gives it air without losing the "fills the frame" weight we just landed.

### Change

In `src/components/ProductLibrary.tsx`, illustration block (the Vårt Vi inline `<img>` style):

| Property | Current | New | Effect |
|---|---|---|---|
| `top` | `-18%` | `-12%` | Drops the illustration ~6% so brown hair clears the top frame |
| `bottom` | `-6%` | `-12%` | Compensates downward bleed so feet/torso stay tucked off-frame, not floating |
| `right` | `-12%` | `-12%` | Unchanged |
| `width` | `92%` | `92%` | Unchanged — same size |
| `objectPosition` | `right bottom` | `right bottom` | Unchanged |

Net effect: same scale, same right anchor — figures just slide down a few pixels. Brown-hair head gains ~8–10px clearance from the top edge; green hair still bleeds confidently close to the frame.

### Expected result

- Brown-hair figure no longer clipped at top.
- Green-hair figure still reads as close to the frame (intentional bleed).
- Text, badge, scrim, background untouched.

### Untouched

- All other tiles, the asset itself, scale, right-bleed.
- Hero / ProductIntro / Journal surfaces.

### Verification

- `/` → Vårt Vi tile: both heads fully visible with ~8px clearance above brown hair.

### Rollback

Revert top/bottom values on the illustration block in `src/components/ProductLibrary.tsx`.

