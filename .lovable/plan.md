

## Still Us Mock Home — 10/10 Polish Plan

### Corrections to my earlier feedback
- The creature illustrations are intentional brand art — they stay and are good.
- Users should take layers in order, not choose freely.

### Changes

**1. Remove "Välj ett ämne" section header**
Replace with nothing, or a subtle sequential cue like layer numbering already present in the tiles themselves. The ordered list communicates sequence inherently.

**2. Reduce hero zone height to show all 5 tiles on first screen**
Currently the hero illustration is 65vh with a large spacer (`clamp(48px, 12vh, 100px)`) pushing tiles far down. Changes:
- Reduce hero image height from `65vh` → `45vh`
- Reduce content paddingTop from `clamp(32px, 10vh, 90px)` → `clamp(24px, 6vh, 56px)`
- Reduce spacer between title/tagline and tiles from `clamp(48px, 12vh, 100px)` → `clamp(20px, 4vh, 40px)`
- Reduce tile gap from `12px` → `10px`
- Reduce tile minHeight from `100px` → `88px`

This should let all 5 tiles fit within the viewport on a 844px screen.

**3. Add sequential ordering cues to tiles**
Since users shouldn't choose freely, add visual affordance for linear progression:
- Show a subtle lock/muted state on tiles whose preceding layer isn't complete (reduced opacity, no saffron border)
- Keep the first incomplete layer as the "recommended" tile with the saffron border glow
- Add a small layer number badge (e.g., "1", "2", "3") in the top-left corner of each tile for sequence clarity

**4. Tighten tagline legibility**
- Increase tagline font weight slightly (400 → 500) and add a touch more contrast via text-shadow tuning

### Files changed
- `src/components/KidsProductHome.tsx` — all layout and logic changes above, gated to `still_us_mock` product ID where behavior differs from other kids products

