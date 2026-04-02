

## Fix: Give CTA Room + Tighten Content Spacing

**File**: `src/components/Onboarding.tsx`

### Issues
- CTA "Börja" button is clipped/hidden behind bottom nav — not enough bottom clearance
- Content section has excessive top padding (`max(48px, env(safe-area-inset-top))`) that steals space from the illustration
- No breathing room between pills and CTA button

### Changes

**1. Content section — reduce top padding**
- Change `paddingTop: 'max(48px, env(safe-area-inset-top, 48px))'` → `paddingTop: 0` — the illustration zone above already provides spacing

**2. CTA — add top padding, increase bottom clearance**
- Add `paddingTop: '16px'` to CTA wrapper for breathing room above button
- Change `paddingBottom` from `calc(24px + env(safe-area-inset-bottom))` → `calc(32px + env(safe-area-inset-bottom))` to clear the bottom nav area

**3. Illustration zone — reduce minHeight slightly**
- Change `minHeight: '180px'` → `minHeight: '140px'` — allows more space for content below on shorter screens while still keeping the logo prominent

### Unchanged
All pill styling, selection logic, typography, tracking, logo size (120px), teal glow.

