# BONKI Brand Document — Print-ready PDF

A polished, designed PDF capturing the essentials of BONKI's design system, sourced directly from the codebase (palette, tokens, memory rules, components). Output saved to `/mnt/documents/bonki-brand-essentials.pdf`.

## Source material (already in the codebase)

- `src/lib/palette.ts` — master color palette + per-product tile colors
- `src/lib/stillUsTokens.ts` — Vårt Vi (Still Us) tokens & layer colors
- `src/lib/motion.ts` — motion durations, beats, easing
- `src/components/BonkiButton.tsx` — signature CTA spec
- `tailwind.config.ts` — typography (Cormorant / DM Sans / Bebas Neue), radii, spacing, shadows
- `src/index.css` + `src/styles/themes.css` — CSS variables (dark shell)
- `src/assets/bonki-logo.png` — logo
- Memory rules (Core + brand voice, terminology, accessibility, iOS PWA)

## Document structure (~12 pages)

1. **Cover** — Logo on Midnight Ink (#0B1026), wordmark, "Brand Essentials 2026"
2. **The brand at a glance** — Mission line, tone, dark-shell + vibrant-content principle
3. **Logo** — Embedded logo, clear-space rule, do/don't (size, recoloring)
4. **Color · Foundations** — Midnight Ink, Deep Dusk, Saffron Flame, Lantern Glow, Bonki Orange, Forest Teal — large rendered swatches with hex
5. **Color · Product palettes** — 7 product tile triplets (light/mid/deep) as a grid: Jag i Mig, Jag med Andra, Jag i Världen, Vardagskort, Syskonkort, Sexualitetskort, Vårt Vi
6. **Color · Vårt Vi (Cobalt theme)** — Ember Night, Ember Mid, Lantern Glow, layer colors (Grunden → Valet) with week ranges
7. **Typography** — Cormorant (display/serif), DM Sans (body), Bebas Neue (brand wordmark) — type specimens at multiple sizes
8. **Voice & language** — Swedish only, ni-språk for couples, du-språk for kids, "samtal" not "kort", "barnet" singular, no diagnostic/therapeutic language, calm professional tone
9. **Components · BonkiButton** — Primary (saffron) + secondary (glassmorphic) specs: 24px radius, shadow stack, press feedback (scale 0.95, y +2)
10. **Motion** — PRESS 120ms, PAGE 280ms, EMOTION 320ms, BEATs (60/120/180), easing curve, "no bounce / no spring" rule
11. **Layout & accessibility** — Dark shell vs vibrant content, iOS Safari rules (100vh + calc, translateZ(0)), focus rings, reduced motion, design tokens via CSS vars only
12. **Back cover** — © Bonki & Friends AB, bonkiapp.com

## Design treatment

- Cover + back: Midnight Ink (#0B1026) background with Saffron Flame accent
- Inner pages: Lantern Glow / off-white background, Midnight Ink text, swatches rendered as filled rectangles with hex labels
- Type pairing in the doc itself: Helvetica/Arial fallbacks (PDF-safe) with sizing that mirrors the Cormorant/DM Sans hierarchy
- Generous margins (0.75"), one accent color per section (drawn from product palette), no decorative lines under titles

## Technical approach

- Generate with Python + ReportLab (Platypus) → `/mnt/documents/bonki-brand-essentials.pdf`
- Embed `src/assets/bonki-logo.png` on cover via `Image` flowable
- Render color swatches as `Table` cells with `BACKGROUND` styles + hex captions
- US Letter, portrait
- QA: convert each page to JPG with `pdftoppm`, inspect every page for overflow/contrast/alignment, fix and re-render until clean
- Deliver via `<lov-artifact>` tag

## Out of scope (per your choices)

- App screenshots
- Per-page deep-dives on every memory rule (would require 50+ pages — that's the "Exhaustive" tier)
- Editable .docx / .pptx versions

Approve and I'll build it.