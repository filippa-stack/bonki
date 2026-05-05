# Product intro page redesign — kids + adult

Redesign of the product intro surface to match the editorial design system already established in the product home and portal/session work. Locked-state only — free-session UI is removed in this pass.

## Files

**Live page (production target):**
- `src/components/ProductIntro.tsx` — locked-state branch redesigned (the only branch we ship in this pass).

**Mock page (sandbox at `/intro-mock/:productId`):**
- `src/components/ProductIntroMock.tsx` — same redesign applied so the sandbox stays in sync. Dev panel + state machine preserved; only the locked + free-equivalent presentation changes.

**Routing dispatch:** not needed. Both `ProductIntro` and `ProductIntroMock` already branch on `productId === 'still_us'` internally — same pattern we used in `KidsCardPortal` / `AdultCardPortal`. We keep a single component per file with an `isStillUs` switch for accent color, illustration treatment, and CTA tint. Forking would duplicate ~80% of the body. (If a later pass shows the adult variant diverging significantly, we can fork then.)

**Data sources (read-only, no edits):**
- `src/data/productIntros.ts` — body copy.
- `src/lib/productPreviewQuestions.ts` — currently one question per product. **Will be expanded** to 2–3 per product (see below).
- `src/lib/palette.ts` — `WARM_GOLD`, `LANTERN_GLOW`, `MIDNIGHT_INK`, `DEEP_DUSK_BG`, `productTileColors` already exported.

## Composition (top → bottom, scrollable column with sticky footer)

### Zone 1 — Hero (top ~28vh)
- Background: `DEEP_DUSK_BG` (`#0B1026`) for adult; `product.backgroundColor` for kids.
- Hero illustration peering in from the top with the existing `PRODUCT_ILLUSTRATION` map; same opacity/fade-to-bg gradient already used.
- Atmospheric radial glow matching product home (cool indigo for adult, product-tinted for kids).
- Title: serif, title-case, `LANTERN_GLOW`, same size as product home (~40px).
- Subtitle: italic serif, ~18px, `LANTERN_GLOW` at 0.85.
- Stays in place on scroll (no parallax — cleanest option, matches product home).

### Zone 2 — Trust signal (immediately below hero)
- Hairlines above and below: `1px solid color-mix(in srgb, ${WARM_GOLD} 35%, transparent)`.
- Eyebrow: `UTVECKLAT AV PSYKOLOG` — `var(--font-display)`, 11px, small caps, `WARM_GOLD` at 0.8, letter-spacing 0.12em.
- Body: `Ida W. · 29 års klinisk erfarenhet` — italic serif, 15px, `LANTERN_GLOW` at 0.95.
- Centered, vertical padding 14px, horizontal margin 24px. Same copy across every product.

### Zone 3 — Intro copy (structured)
- Read `productIntros[productId].slides`, join bodies, then split on `\n\n`.
- First paragraph treated as opening statement: serif, 18px, `LANTERN_GLOW` full, line-height 1.4, ~24px vertical margin.
- Remaining paragraphs: `var(--font-display)`, 15px, `LANTERN_GLOW` at 0.85, line-height 1.55, 16px gap.
- Restructure-only: if a paragraph is >3 sentences, split at a natural sentence boundary inside the renderer (display-level only — no edits to `productIntros.ts`).

### Zone 4 — Example questions (amplified)
- Stack of 2–3 question cards, 16px gap.
- Per card: 1px hairline border `rgba(255,255,255,0.10)`, bg `rgba(255,255,255,0.02)`, padding 24/20.
- Eyebrow: `EN FRÅGA UR {product.name}` small caps, 11px, `LANTERN_GLOW` at 0.55, letter-spacing 0.10em.
- Question: italic serif, 17px, centered, `LANTERN_GLOW` full, smart quotes.
- **Data change:** convert `PREVIEW_QUESTION` in `src/lib/productPreviewQuestions.ts` from `Record<string, string>` to `Record<string, string[]>`. Seed each product with 2–3 questions pulled from existing card content (`src/data/content.ts` for Still Us; product card prompts for kids products) — one lighter, one harder, one introspective. `BuyPage.tsx` (also consumes this file) updated to render `[0]` to preserve current behavior.

### Zone 5 — Sticky bottom (price + CTA)
- `position: sticky; bottom: 0;` wrapper, respects `env(safe-area-inset-bottom)`.
- 16px fade gradient `linear-gradient(to top, ${bgColor}, transparent)` above the sticky block so content fades under it.
- Price line: `{product.cards.length} samtal · {priceSek} kr · engångsköp` — `var(--font-display)`, 13px, `LANTERN_GLOW` at 0.7, letter-spacing 0.04em, centered.
- CTA pill: full-width minus 24px margin, height 56px, border-radius 28px.
  - Adult: bg `color-mix(in srgb, ${WARM_GOLD} 28%, rgba(255,255,255,0.06))`, border `1px solid color-mix(in srgb, ${WARM_GOLD} 50%, transparent)`, text `LANTERN_GLOW`.
  - Kids: same pill, swap `WARM_GOLD` for `productTileColors[productId].tileLight`.
  - Label: `Köp {product.name} · {priceSek} kr` — display font, 16px, weight 600. Price suffix at 0.85 opacity (single span with reduced opacity inside the button).
- CTA still calls existing `handleCta` → `navigate('/buy?product=' + productId)`. No payment-flow changes.

### Zone 6 — Below-fold
- Not added. No existing extra content to preserve.

## Removals

- **Free-session CTA path** in `ProductIntro.tsx`: drop the `hasFreeCard` / `onStartFreeCard` branch and the green ghost-glow "Använd mitt gratis-samtal" button. Keep the props in the signature (callers already pass them) but ignore them this pass — avoids ripple changes in `ProductHome.tsx`. A `// TODO: free-session branch returns in a later release` comment marks the spot.
- **MOCK debug pill** in `src/pages/ProductIntroMock.tsx`: gate the orange `MOCK · /intro-mock → /library-mock` link behind `import.meta.env.DEV` so it never appears in production builds.
- **Dev panel** in `ProductIntroMock.tsx`: also gate behind `import.meta.env.DEV` (it already only matters in sandbox).

## Behavior preserved
- Routing, payment, paywall, telemetry (`onboarding_events` insert), `markProductIntroSeenServer`, `usePageBackground`.
- All `productIntros.ts` copy verbatim — only display structure changes.
- Kids vs adult dispatch via `isStillUs` flag (existing pattern).
- Sexualitet safety signoff line still rendered below the CTA.

## Verification (390×844)

**Adult (`/product/still-us` first visit, or `/intro-mock/still_us`):**
- Deep Dusk hero with couple illustration + glow.
- Hairline-bracketed trust block: `UTVECKLAT AV PSYKOLOG` / `Ida W. · 29 års klinisk erfarenhet`.
- One prominent serif opening line, then 2 short paragraphs with breathing room.
- 2–3 italic-serif question cards stacked with `EN FRÅGA UR VÅRT VI` eyebrows.
- Sticky bottom: price line + warm-gold pill `Köp Vårt Vi · 249 kr`. Never clips. Content fades under.
- MOCK pill not present in production build.

**Kids (`/intro-mock/jag_i_mig`):**
- Teal hero with painterly illustration.
- Same trust block (Ida W.).
- Same structured copy + 2–3 question cards.
- Sticky bottom pill in kids accent: `Köp Jag i Mig · 195 kr`.

**Both:**
- Sticky CTA respects `safe-area-inset-bottom`.
- No free-session button visible.
- Scrolling content fades under the sticky region (no hard edge).
