# Three small visual calibrations

## 1. Screen 2 — bottom-anchor the CTA cluster

**File:** `src/components/OnboardingMock.tsx` (`ScreenPromise`)

Tighten three values inside the bottom cluster so the dash row sits in the same visual band as Screens 1 and 3:

- Line 254: CTA block `paddingTop: 22` → `paddingTop: 18`
- Line 293: legal `<p>` `marginTop: 16` → `marginTop: 14`
- Line 309: dash wrapper `marginTop: 16` → `marginTop: 12`

Net ~8px tighter. If still off after one pass, next step is paddingTop 18→14 and marginTops to 12 and 8 — not a structural rework.

## 2. Screen 2 — logo 32px → 36px

**File:** `src/components/OnboardingMock.tsx`, line 189

`<BonkiLogoMark size={32} ... />` → `<BonkiLogoMark size={36} ... />`. Color, opacity (0.85), centering, marginBottom (18) all unchanged. Screen 3's 120px logo untouched.

## 3. Library resume banner — visual presence

**File:** `src/components/ProductLibraryMock.tsx` (`MockResumeBanner`)

- Background gradient: `accentRgba(0.30) … accentRgba(0.06)` → `accentRgba(0.55) … accentRgba(0.18)` (left third now carries visible product color, fading to neutral by 70%).
- Accent dot: `8×8` → `10×10`; glow blur `0 0 10px` → `0 0 12px` to match.
- Border: `rgba(253,246,227,0.08)` → `rgba(253,246,227,0.14)`.

## Files touched

- `src/components/OnboardingMock.tsx`
- `src/components/ProductLibraryMock.tsx`

No other files. Live `Onboarding.tsx`, `ProductLibrary.tsx`, paywall, free-card policy untouched.
