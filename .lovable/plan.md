

## Onboarding: Restore Illustration Prominence + Compact Pills

### Problem
The four stacked cards with two-line text + padding eat ~280px of vertical space, pushing the illustration into a cramped top strip. The logo feels like a ghost watermark instead of the hero light source. The layout lost its editorial breathing room.

### Root Cause
The pills went from compact single-line to two-line cards with 16px padding each + 8px gaps + the "Var vill ni börja?" label + the reassurance text. That's ~300px of fixed content below the fold, leaving barely any room for the illustration zone on a 844px screen.

### Solution: Two-Tier Fix

**1. Illustration zone — hero, not ghost**
- Increase logo from `160px` → `200px` width
- Change illustration container from `height: 45%` to `flex: 1 1 auto` with `minHeight: 180px` — it takes whatever space the pills don't need
- Add a subtle radial glow *behind* the logo (not saffron — use the logo's own green/teal tones at ~0.15 opacity, ~280px spread) so it genuinely feels like the light source illuminating the page

**2. Compact the pills — single-line with inline subtitle**
- Merge title + subtitle into one line: **"Barn 3–6"** · *Känslor och inre värld*
- Title in display font 16px, dot separator, subtitle in sans 13px at 0.5 opacity — all on one row
- Reduce padding from `16px 20px` → `12px 16px`
- Keep chevron, selected state logic, border treatment unchanged
- This saves ~100px of vertical space

**3. Tighten spacing**
- Reduce gap between pills from `8px` → `6px`
- Remove `minHeight: 20px` wrapper on reassurance text — use simple `marginTop: 8px`
- Reduce CTA bottom padding from `32px` → `24px`

### File Changes
`src/components/Onboarding.tsx` only — no new files, no logic changes.

### Unchanged
All selection logic, localStorage writes, tracking, CTA behavior, credential/headline/body text, `initial={false}` stability pattern.

