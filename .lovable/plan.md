

## Onboarding: Final Polish to 10/10

**File**: `src/components/Onboarding.tsx`

### Current state
- Layout, tiles, typography, and CTA are all solid
- The "Börja" button clipping in the screenshot is a **dev-only artifact** — BottomNav hides during real onboarding (line 57 of BottomNav.tsx). In `?devState=onboarding` mode the nav stays visible because of the devBypass check
- One real issue: `paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 0px))'` — the `0px` fallback means on standard web browsers (no safe-area) the button sits tight to the very bottom edge

### Single change
**CTA wrapper padding** (line 208): Change the safe-area fallback from `0px` to `16px`:
```
paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 16px))'
```
This gives 48px bottom clearance on web (comfortable) and defers to the actual safe-area inset on native devices.

### Unchanged
Everything else — tiles, typography, illustration, body text, logic, tracking.

