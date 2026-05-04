# Intro page mock — free + locked + redirect states

Add `/intro-mock/:productId` sandbox to evaluate the intro CTA state machine without touching live `ProductIntro.tsx`. Mirrors the `/library-mock` and `/onboarding-mock` pattern.

## Files

**New**
- `src/components/ProductIntroMock.tsx` — full intro layout + state machine + dev panel.
- `src/pages/ProductIntroMock.tsx` — page wrapper + top-right `MOCK` badge linking to `/library-mock`.

**Modified**
- `src/App.tsx` — register `<Route path="/intro-mock/:productId" element={<ProductIntroMockPage />} />` inside `ProtectedContent`, alongside `/library-mock` and `/onboarding-mock`.

## State machine

Driven by localStorage with a React-state dev-panel override:
- `bonki-mock-welcome-spent` (`'1'` once any welcome session used)
- `bonki-mock-welcome-product` (productId where it was spent)
- `bonki-mock-purchased-{productId}` (per-product purchase flag)

Resolved states for current `:productId`:
1. **purchased** → render-time `<Navigate to={`/product/${slug}`} replace />`.
2. **alreadyUsedHere** (`spent && welcomeProduct === productId`) → placeholder block "Paywall would render here — coming next" + `Tillbaka till biblioteket`.
3. **locked** (`spent && welcomeProduct !== productId`) → orange `Köp · 195 kr` CTA + `Du har redan använt ditt gratis-samtal i {otherProductName}.`
4. **free** (default) → ghost-glow `Använd mitt gratis-samtal` CTA.

Dev panel buttons (`Free`, `Locked (i Jag i Mig)`, `Purchased`) clear localStorage flags then set a forced override so flips happen without seeding storage. "Locked" hardcodes the `otherProductName` display as `Jag i Mig`.

## Layout (shared)

- Full-bleed creature illustration backdrop (top 42%, fade into midnight-ink), back arrow top-left, content column with 28px horizontal padding.
- **Headline**: just `product.name` (no `Välkommen till` prefix). Fraunces 34px wt 500, lantern-glow, text-shadow `0 2px 12px rgba(0,0,0,0.35)`.
- **Subhead**: tagline from local `TAGLINES` map (`Jag i Världen → "En värld som vidgas"`, etc.). Fraunces italic 18px, lantern-glow @ 92%.
- **Body**: `productIntros[productId].slides[*].body` joined with `\n\n`. Inter 16px, lantern-glow @ 92%, line-height 1.5. Unchanged.
- **Sample question card**: eyebrow `EN FRÅGA UR {product.name}` + Fraunces italic quoted `PREVIEW_QUESTION[productId]`. Unchanged.

## CTA region — Free

1. `Resten av {productName} — 195 kr` (Inter 14px wt 500, lantern-glow @ 90%).
2. `Utvecklat av psykologer · 29 års klinisk erfarenhet` (Inter 12px @ 65%).
3. Full-width 56×14px CTA, bg `#D4F5C0`, text `#0F1727`, Inter 14px wt 600 — `Använd mitt gratis-samtal`.
   - Mock click: sets `welcome-spent='1'`, `welcome-product=productId`, navigates to `/library-mock`.
   - **Live migration note**: in production this should navigate to `/card/{firstCardId}` instead.
4. Soft decline `Inte just nu` (text-only, lantern-glow @ 70%).

## CTA region — Locked

1. `{productName} — 195 kr` (no `Resten av` framing).
2. Same credentials line.
3. Full-width 56×14px CTA, bg `#E85D2C`, text lantern-glow — `Köp · 195 kr`. Click sets `bonki-mock-purchased-{productId}` and navigates to `/library-mock`.
4. `Du har redan använt ditt gratis-samtal i {otherProductName}.` (Inter 11.5px @ 60%).
5. Same soft decline.

## Removed vs live intro (mock only)

- `195 kr · Engångsköp · Tillgång för alltid` line.
- `Säker betalning · Ingen prenumeration` defensive line.
- Per-product CTA accent (replaced by ghost-glow / orange per state).
- `Välkommen till\n` prefix in the headline.

## Verification

- `/intro-mock/jag_i_varlden` (clean state) → ghost-glow CTA, `Resten av Jag i Världen — 195 kr`, headline reads only `Jag i Världen`.
- Dev panel `Locked` → orange `Köp · 195 kr` + `Du har redan använt ditt gratis-samtal i Jag i Mig.`
- Dev panel `Purchased` → immediate redirect to `/product/{slug}`.
- Live `ProductIntro.tsx`, paywall, free-card policy, library/onboarding mocks untouched.

## Out of scope

- Paywall design after free session (next prompt).
- Real `welcome_product_id` backend field.
- Body copy edits.
- Sexualitetskort intro mock variant.
