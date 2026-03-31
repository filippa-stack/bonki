

## Fix Flicker on Onboarding, ProductIntro, and Paywall Pages

### Problem
These pages use `motion.div` entrance animations (`initial: { opacity: 0 }`, fade-ups, scale-ins) that cause a visible flicker on iPhone — the same issue previously fixed on Journal/Era samtal by disabling mount animations.

Additionally, `ProductIntro` and `PaywallFullScreen` are missing `usePageBackground`, so `#root`'s dark background bleeds through safe areas.

### Two fixes per page (matching the Journal pattern)

**Fix 1 — Kill mount animations**: Replace all `initial={{ opacity: 0, ... }}` with `initial={false}` (or remove the motion wrapper entirely where it only exists for entrance animation). This matches the animation-mount-policy.

**Fix 2 — Add `usePageBackground`**: Call the hook with the page's root background color so the device canvas is fully owned.

### Changes

| File | Fix 1: Animations to disable | Fix 2: `usePageBackground` color |
|---|---|---|
| `src/components/Onboarding.tsx` | `fadeUp` helper: change `initial` to `{ opacity: 1, y: 0 }`. Illustration `motion.div` (line 46): `initial={false}`. | Already has `usePageBackground('#1A1A2E')` — no change |
| `src/components/ProductIntro.tsx` | Creature illustration (line 177): `initial={false}`. Back button (line 224): `initial={false}`. Title h1 (line 266): `initial={false}`. Tagline p (line 287): `initial={false}`. Body div (line 305): `initial={false}`. Free card preview (line 347): `initial={false}`. CTA div (line 430): `initial={false}`. All 7 motion elements. | Add `usePageBackground(bgColor)` after line 122 where `bgColor` is computed |
| `src/pages/PaywallFullScreen.tsx` | Root `motion.div` (line 138): `initial={false}`. Back button (line 152): `initial={false}`. 2 motion elements. | Add `usePageBackground(MIDNIGHT_INK)` at component top |
| `src/pages/Paywall.tsx` | Inner `motion.div` (line 117): `initial={false}`. 1 motion element. | Already has `usePageBackground(COLORS.emberNight)` — no change |

### Implementation detail

- `initial={false}` tells Framer Motion to skip the entrance animation and render the `animate` state immediately — no opacity:0 frame, no flicker.
- The `fadeUp` helper in Onboarding is used by 4 elements via spread (`{...fadeUp(0.35)}`). Change it to return `initial: { opacity: 1, y: 0 }` so it renders at final state immediately. The `animate` and `transition` values become no-ops but are harmless to keep.
- `ProductIntro` computes `bgColor` at line 122 (`backgroundColor ?? product?.backgroundColor ?? MIDNIGHT_INK`). The hook call goes right after that line.
- `PaywallFullScreen` uses `MIDNIGHT_INK` for its root background. The "not found" early return (line 59-64) also uses `MIDNIGHT_INK` — consistent, no mismatch issue.

### Not modified
- No layout, spacing, typography, or scroll changes
- No navigation or z-index changes  
- User-triggered animations (e.g. `expanded` toggle in ProductIntro) are preserved
- The `AnimatePresence` exit animations in these components (if any) are untouched

