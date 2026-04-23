

## Enlarge the Vårt Vi tile illustration

You're right — the figures look ~15% smaller than the Jag i Mig girl and lack the confident "fills the frame" presence of the kids tiles. The fix is to grow the container by pulling the top-left corner up and out, while keeping the right-bottom anchor so the careful composition we just landed isn't disturbed.

### Change

In `src/components/ProductLibrary.tsx`, illustration block at lines 986–1009:

| Property | Current | New | Effect |
|---|---|---|---|
| `top` | `-8%` | `-18%` | Pulls top edge up, gives green hair room to bleed close to frame |
| `right` | `-10%` | `-12%` | Slightly more right-edge bleed, parity with kids tiles |
| `bottom` | `-8%` | `-6%` | Tiny lift so feet/torso don't get clipped |
| `width` | `78%` | `92%` | Container grows ~18% — figures scale up proportionally |
| `objectPosition` | `right bottom` | `right bottom` | **Unchanged** — anchor stays in the safe corner |
| `objectFit` | `contain` | `contain` | **Unchanged** — preserves aspect ratio, no distortion |

Because `objectFit: contain` + `objectPosition: right bottom` is preserved, the illustration scales up from the right-bottom anchor. The figures grow upward and leftward — green hair moves toward the top edge, the wordmark area on the left stays clear.

### Expected result

- Vårt Vi figures occupy roughly the same visual mass as the Jag i Mig girl.
- Green hair sits ~10–14px from the top frame (matching the Jag i Mig girl's hair-to-frame ratio).
- "Vårt Vi" wordmark + tagline still breathe in clean negative space on the left.
- Right edge has a confident bleed, same compositional language as the rest of the library.

### Untouched

- Text scrim, badge, background color, drop-shadow filter.
- All other tiles.
- Hero / ProductIntro / Journal surfaces (separate asset).

### Verification

- `/` → Vårt Vi tile figures fill frame with ~10px clearance from top, anchored right-bottom, text area on left unchanged.

### Rollback

Single revert of `src/components/ProductLibrary.tsx` lines 986–992.

