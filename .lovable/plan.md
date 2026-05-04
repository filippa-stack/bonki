# Onboarding mock: real logo + layout fixes

Three corrections on `/onboarding-mock`. Library mock is intentionally untouched.

## 1. Real logo asset (transparent PNG, ghost-glow line baked in)

Asset already saved to `src/assets/bonki-logo.png` (transparent background, line color `#D4F5C0` baked in).

Rewrite **`src/components/BonkiLogoMark.tsx`**:
- Import: `import logoSrc from '@/assets/bonki-logo.png'`.
- Render `<img src={logoSrc} width={size} height={size} alt="" aria-hidden …>` with `display: block; object-fit: contain` and the standard `className` / `style` passthrough.
- Preserve the existing prop API (`size`, `color`, `className`, `style`, `aria-hidden`) so every current call site keeps compiling without changes.
- The `color` prop becomes a true **no-op** — the line color is baked into the PNG. JSDoc explicitly documents this so a future caller doesn't pass `color="orange"` and wonder why nothing happens. If we ever need a non-ghost-glow logo, we'll export a separate asset rather than recolor at runtime.
- **Tiny-size fallback** (`size <= 12`): render a 6×6 ghost-glow (`#D4F5C0`) circle `<span>` instead of the image. The PNG can't render crisply at 9px (used in the library "Du har provat" pill); the surrounding text carries the meaning, the icon is decorative.

The Screen 3 halo wrapper already wraps the logo (not the SVG internals), so the 3s pulsing animation continues to work after the swap.

## 2. Hide BottomNav + reposition MOCK badge on onboarding only

Root cause of the cropped CTAs: `App.tsx` mounts `<BottomNav />` globally (line 121) for every protected route, including `/onboarding-mock`. The bottom nav overlays the bottom ~64px of the viewport.

**`src/components/BottomNav.tsx`** — add one line alongside the existing hide rules (around line 60):
```ts
if (pathname === '/onboarding-mock') return null;
```
Surgical, minimal. Live `Onboarding.tsx` flow is unaffected — it doesn't use this path.

**`src/pages/OnboardingMock.tsx`** — move the MOCK dev badge from `bottom: …` to:
```ts
top: 'calc(env(safe-area-inset-top, 0px) + 50px)'
```
The +50px clears the iPhone dynamic island / notch on real devices. Keep the rest of the badge styling (orange pill, z-index 9999, `translateZ(0)`, right: 12).

After this: the three onboarding screens own the full viewport; CTAs sit ~24px above the safe-area bottom edge with no chrome overlap.

## 3. Screen 2 vertical balance

Current `ScreenPromise` in `OnboardingMock.tsx` uses `flex: '0 0 18%'` as a fixed top spacer, which is why everything bunches above center.

Rebalance to match Screen 3's distribution:
- Replace the `flex: '0 0 18%'` spacer with `<div style={{ flex: 0.7 }} />` (flexible, breathes with viewport height).
- Wrap the CTA block (Google button + "Logga in med e-post" link) in a container with `marginTop: 'auto'` so it pushes toward the bottom of the available space, after the price rows.
- Legal footer + `DashProgress` follow naturally below the CTA block in normal flow with their existing margins.
- Result: top spacer → logo → promise → credentials → divider → prices → flexible space → CTA → legal → dashes, with the legal footer sitting near the bottom edge instead of mid-screen.

Screens 1 and 3 are already balanced — only verify they're now uncropped after fix #2.

## 4. Verification (post-ship)

- `/onboarding-mock` Screen 1: "Fortsätt" fully visible with ≥20px clearance.
- Screen 2: Google CTA + email link + legal footer all visible; legal sits near bottom edge.
- Screen 3: "Visa biblioteket" fully visible; halo still pulses around the new PNG logo.
- MOCK badge appears top-right (below notch) on all three screens; no `BIBLIOTEKET / HEM / ERA SAMTAL` bar visible.
- `/library-mock` unchanged: bottom nav present, MOCK badge bottom-right.
- Live `/`, `Onboarding.tsx`, `ProductLibrary.tsx`, paywall, free-card policy untouched.

## Files touched

- `src/assets/bonki-logo.png` — new (already copied from upload)
- `src/components/BonkiLogoMark.tsx` — refactor to `<img>` + tiny-size dot fallback + JSDoc note that `color` is a no-op
- `src/components/BottomNav.tsx` — one-line guard for `/onboarding-mock`
- `src/components/OnboardingMock.tsx` — Screen 2 flex rebalance only
- `src/pages/OnboardingMock.tsx` — MOCK badge top-right, +50px notch clearance

No other files. The four protected ref patterns (`suppressUntilRef`, `prevServerStepRef`, `pendingSave`, `hasSyncedRef`) are not touched.
