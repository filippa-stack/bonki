

## Assessment

Your suggestion correctly identifies the core problem: the illustration consumes too much vertical space, pushing the CTA below the fold on shorter screens. The approach of making the illustration a background element is the right structural fix.

**One refinement**: reducing the logo to 0.25 opacity effectively erases the brand — it becomes noise rather than atmosphere. I'd suggest **0.35 opacity** as the sweet spot: ghostly enough to not compete with text, visible enough to register as intentional branding.

---

## Plan: Onboarding Layout Restructure

**File**: `src/components/Onboarding.tsx`

### Step 1 — Illustration becomes absolute background
- Change the `<motion.div>` illustration wrapper from `flex: '1 1 0'` layout participant to `position: 'absolute'`, `top: 0`, `left/right: 0`, `height: '45%'`, `zIndex: 0`
- Reduce image from 240px → 160px, opacity 0.88 → **0.35**, remove brightness/saturate filters
- Remove the bottom-fade sibling `<div>` entirely (lines 82–92) — no longer needed

### Step 2 — Content fills screen, anchored to bottom
- Outer container keeps `display: flex; flexDirection: column` but adds `justifyContent: 'flex-end'`
- Content div gets `flex: '1 1 auto'`, `justifyContent: 'center'` to vertically center text in the space above pills/CTA
- Add `paddingTop: 'max(48px, env(safe-area-inset-top, 48px))'` to the content div (moved from illustration)

### Step 3 — Pills and CTA always visible
- Pills wrapper and CTA wrapper both get `flex: '0 0 auto'` — they never shrink
- CTA `paddingBottom` stays `calc(32px + env(safe-area-inset-bottom, 0px))`

### Step 4 — Reposition ambient glow
- Move saffron glow from `top: '8%'` to `top: '40%'` so it radiates around the headline area instead of the now-ghosted illustration

### Unchanged
All text, colors, fonts, pill logic, CTA behavior, localStorage writes, `completeOnboarding()`, `initializeCoupleSpace()`

### Verification targets
- iPhone SE (375×667): all content visible without scrolling
- iPhone 14 (390×844): generous breathing room, centered text
- Logo visible as soft ghost, "UTVECKLAT AV PSYKOLOG" fully legible

