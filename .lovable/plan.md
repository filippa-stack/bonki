

## Onboarding: Close the Dead Space + Restore Illustration Glow

**File**: `src/components/Onboarding.tsx`

### Problem
The content section (`flex: 1 1 auto`, `justifyContent: 'center'`) creates a large empty gap between the body text and the pills. The illustration at 0.35 opacity with no filters feels flat compared to the original glowing version.

### Fix 1 — Eliminate dead space by changing content distribution
- Change the content div (line 85) from `justifyContent: 'center'` to `justifyContent: 'flex-end'` so text content sits just above the pills instead of floating in the vertical center
- Add `paddingBottom: '24px'` to the content div to create a consistent, intentional gap between body text and pills (instead of the flex-center gap)
- Reduce pills wrapper top padding from `28px` to `16px` (line 155)

### Fix 2 — Restore illustration glow
- Add back the brightness and saturate filters on the `<img>`: `filter: 'brightness(1.15) saturate(1.3)'`
- Move the saffron ambient glow from `top: '40%'` back to `top: '8%'` (line 69) so it wraps around the illustration, creating the warm lantern effect
- Optionally increase glow intensity slightly: change `hsla(40, 78%, 61%, 0.14)` to `hsla(40, 78%, 61%, 0.18)` for the inner stop

### Unchanged
All text, colors, fonts, pill labels/values/logic, CTA behavior, localStorage writes, `completeOnboarding()`, `initializeCoupleSpace()`, illustration size (160px) and opacity (0.35), absolute positioning of illustration

### Result
- Content flows naturally: illustration ghost at top, text in upper-middle, pills and CTA anchored at bottom, no dead zone
- Illustration has a warm atmospheric glow like the original, while remaining a background element

