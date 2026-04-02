

## Onboarding: Smaller Logo + Premium 1-Line Pills, No Scroll

**File**: `src/components/Onboarding.tsx`

### Changes

**1. No scroll — fixed viewport layout**
- Change `overflowY: 'auto'` → `overflow: 'hidden'` on the outer container

**2. Smaller logo, fully visible**
- Reduce logo width from `200px` → `120px`
- Reduce radial glow from `280px` → `200px` to match
- The illustration zone keeps `flex: 1 1 auto` so it absorbs remaining space — but with a smaller logo it breathes instead of cramming

**3. Premium 1-line pills without chevron**
- Keep single-line layout: **Title** · *Subtitle*
- Remove the chevron `›` entirely (lines 191–195)
- Change `justifyContent: 'space-between'` → remove it (no longer needed without chevron)
- Add `boxShadow: '0 0 12px hsla(40, 78%, 61%, 0.15)'` on selected state for warm glow
- Bump title font to `17px`, padding to `14px 18px`

### Unchanged
All logic, selection state, localStorage, tracking, CTA, credential/headline/body text, teal radial glow behind logo, `initial={false}` stability pattern.

