

## Onboarding → 10/10 Premium Polish

### Changes (1 file: `src/components/Onboarding.tsx`)

**1. Upgrade CTA to BonkiButton**
- Import and use `BonkiButton` instead of the custom ghost button
- Label: "Börja" — the signature saffron gradient + 3D depth makes it unmistakably tappable
- Remove inline `onMouseEnter`/`onMouseLeave` handlers (BonkiButton handles its own press states)
- This eliminates the `backdropFilter: 'blur(20px)'` flicker risk as a side effect

**2. Increase headline size**
- Change `fontSize: '1.65rem'` → `fontSize: 'clamp(28px, 7.5vw, 38px)'`
- This matches the premium weight of product homes without competing at the same scale

**3. Fix vertical rhythm — remove dead space**
- Content wrapper: change `flex: 1` → `flex: '0 1 auto'`, add `marginTop: 'auto'` so text block gravitates toward the bottom half, closing the gap between illustration and text
- Add `marginBottom: '32px'` on content wrapper to maintain breathing room above CTA

**4. Credential text: meet minimum readability**
- Change `fontSize: '11px'` → `'15px'` (app standard minimum)
- Change `color` to `LANTERN_GLOW` (#FDF6E3) at `opacity: 0.5` — visible on OLED, hierarchically below body text

**5. Strengthen divider**
- Change opacity from `0.35` → `0.5`
- Change height from `1.5px` → `2px`

**6. Body text hierarchy**
- Change `opacity: 0.8` → `0.85` — slightly more readable while still below heading

### What stays untouched (safety)
- `initial={false}` and `duration: 0` on all motion elements
- `position: fixed` container and `overflow: hidden`
- `usePageBackground('#1A1A2E')` hook
- `trackOnboardingEvent` call and `completeOnboarding`/`initializeCoupleSpace` logic
- Logo image sizing, filter, and fade gradient
- No new animations or `AnimatePresence` added

