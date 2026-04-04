

## Rebuild /install — Emotional, Premium, Honest

### Summary
Complete visual rebuild of `src/pages/Install.tsx`. Keep platform detection, standalone redirect, Meta Pixel tracking, and route registration. Replace all JSX content.

### Single file change: `src/pages/Install.tsx`

**Remove entirely:**
- `BenefitCard` component and its imports (`Shield`, `Wifi`, `Zap`)
- `StepItem` component
- Fake rating ("★ 4.9 · 10 000+ par")
- Three benefit cards section
- "Så installerar du" heading
- Second CTA button at bottom
- `stepsRef` (no longer needed for scroll)

**New structure (top → bottom), all within a single scrollable dark page (`#0B1026`):**

1. **Logo + wordmark + tagline** — BONKI logo (72px), "BONKI" text below in display font, tagline "Verktyg för samtalen som inte blir av" in muted text
2. **Hero illustration** — `illustration-still-us-home.png` at ~40vh, semi-transparent (0.85 opacity), centered, atmospheric treatment matching ProductIntro pattern
3. **Value proposition** — "Samtal som förändrar er vardag." as serif headline (28px), supporting line about psykologer + verkliga samtal
4. **Trust stats** — Three compact columns: "7 produkter" · "130+ samtal" · "1 gratis per produkt" — no fake numbers
5. **Single CTA** — Bonki Orange button "Öppna appen" firing `trackPixelEvent('InstallCTA')`, navigates to `/` (opens the app). Subtitle: "Ingen nedladdning krävs — öppnas direkt i din webbläsare."
6. **iOS install guide** — Conditional on `platform === 'ios'`: compact card with "Lägg till på hemskärmen" showing share icon → add-to-homescreen two-step visual
7. **Login link** — "Redan medlem? Logga in" linking to `/login`

**Imports to add:** `illustrationStillUs from '@/assets/illustration-still-us-home.png'`
**Imports to remove:** `Shield, Wifi, Zap` from lucide, `useRef`

**CTA behavior:** Instead of scrolling to steps, the button navigates to `/` (opens the app in-browser). On Android with `beforeinstallprompt` available, trigger native install prompt. On iOS, scroll to the install guide card. Fire `trackPixelEvent('InstallCTA')` in all cases.

**Animation:** Keep `fadeUp` variants with `animate="visible"` (not `whileInView`) for the hero section to ensure immediate visibility. Use staggered custom indices for premium feel.

