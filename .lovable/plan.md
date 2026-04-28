# Two New Bonki Reference PDFs

Generate two designed, print-ready PDFs in the same visual language as `bonki-brand-essentials.pdf` and `bonki-product-catalogue.pdf` (Vera fonts, Midnight Ink dark shell, Saffron accents, light spreads where helpful).

Both documents reflect **only the live, shipping app** — no test/demo flows, no removed routes (e.g. legacy `/check-in`, `/share`, `/format-preview`, `/tier2-setup`, `/session/.../session2-start`), no analytics that have been stripped out.

---

## Document 1 — `bonki-pricing-model.pdf`

**Purpose:** A clear reference of how Bonki monetises and what the user actually pays for.

**Sources:** Live `products` table (verified via DB), `src/lib/freeCardPolicy.ts`, `src/pages/Paywall.tsx`, `src/pages/PaywallFullScreen.tsx`, `src/components/ProductPaywall.tsx`, `supabase/functions/create-checkout/`, `revenuecat-webhook/`, `stripe-webhook/`, `useProductAccess.ts`.

**Pages (~7–9):**
1. Cover — "Pricing & Purchase Model 2026"
2. Model overview — One-time purchase, no subscriptions, lifetime access per product
3. Price list — All 7 products with live SEK prices:
   - Jag i Mig, Jag med Andra, Jag i Världen, Vardag, Syskon, Sexualitet — **195 kr** each
   - Vårt Vi (Still Us) — **249 kr**
4. Free starter card policy — 1 free card based on onboarding audience (`young → jag_i_mig`, `middle → jag_med_andra`, `teen → jag_i_varlden`, `couple → still_us`); legacy users get all free starters
5. Purchase flows — Web (Stripe Checkout via `create-checkout` edge function) vs iOS native (Apple StoreKit via RevenueCat) vs Android (currently disabled with explanatory message)
6. Entitlement model — `user_product_access` table grants permanent access; checked via `useProductAccess` hook
7. Paywall surfaces — Where users encounter paywalls (`/paywall-full?product=…` for kids products, `/unlock` for Still Us second session)
8. What is NOT charged — Onboarding, journal, free starter card, account features
9. Refunds & support — Brief note (engångsköp, no subscription to cancel)

---

## Document 2 — `bonki-ux-architecture.pdf`

**Purpose:** A reference map of the live user experience — flows, routes, screens, and the rules that govern navigation.

**Sources:** Live `src/App.tsx` route table (verified above), `src/pages/Index.tsx`, `src/components/Onboarding.tsx`, `src/components/BottomNav.tsx`, `ProductHome.tsx`, `KidsCardPortal.tsx`, `CardView.tsx`, `Journal.tsx`, memory files for navigation/portal/session/paywall logic.

**Pages (~12–15):**
1. Cover — "UX Architecture 2026 (Live)"
2. App shell — Auth gate → Couple/Session providers → Protected routes → BottomNav; loading screen behavior
3. Entry & onboarding — `/login` → audience selection → home; free card eligibility set here
4. Home (`/`) — Library tiles, guidance banner, install banner, resume card
5. Bottom navigation — Hem / Bibliotek / Journal; library-tab redirect bypass logic
6. Live route map (ASCII diagram) — only routes mounted in `App.tsx` today, grouped:
   - Public: `/login`, `/privacy`, `/delete-account`, `/buy`, `/claim`, `/screenshot-export`, `/analytics`
   - Core: `/`, `/product/:slug`, `/category/:id`, `/card/:id`, `/preview/:id`, `/journal`, `/diary/:productId`
   - Kids portal: `/product/:slug/portal/:categoryId`
   - Still Us: `/still-us/explore`, `/still-us/intro`, `/session/:cardId/complete`, `/session/:cardId/tillbaka`, `/session/:cardId/tillbaka-complete`, `/ceremony`, `/journey`, `/solo-reflect/:cardId`, `/journey-preview`, `/settings/dissolve`
   - Paywalls: `/paywall-full`, `/unlock`
7. Kids product flow — ProductHome → ProductIntro → KidsCardPortal → CardView → CardComplete → recommendation chain
8. Still Us (Vårt Vi) flow — Intro Portal → Session Live → Tillbaka (reflection) → Card Complete → next samtal; Ceremony after final samtal
9. Session lifecycle — Activation, heartbeat, pause/exit, conflict handling, sync stability
10. Paywall logic — Functional gates: free card eligibility, `useProductAccess`, paywall routing
11. Journal & Diary — Per-product reflection retrieval, archive status filtering, takeaways
12. Couple space — Pairing, realtime progress sync, partner notifications
13. Persistence & resilience — Loading gates, render persistence, iOS PWA stability rules
14. Removed/legacy surfaces (explicit "not in live app" page) — Lists redirect-only routes (`/check-in`, `/share`, `/format-preview`, `/tier2-setup`, `/session/.../session2-start`, `/saved`, `/categories`, `/install`) so the doc is unambiguous about what is dead
15. Closing — Architectural principles (Swedish only, no diagnostic language, RLS-secured, Test/Live env separation)

---

## Technical approach

- Single Python script per doc using ReportLab + bundled Vera TTFs (proven from prior PDFs).
- Reuse helpers from prior generators: `fill_bg` with alpha reset, `draw_titled_item`, NextPageTemplate before PageBreak.
- Logo assets: `bonki-logo.png` (light pages), `bonki-logo-transparent.png` (dark pages).
- Color tokens pulled from `src/lib/palette.ts` and `stillUsTokens.ts`.
- Mandatory QA: convert each generated page to JPEG with `pdftoppm -r 150`, inspect every page for overflow/overlap/clipping/contrast, iterate until clean. Report QA findings in final response.

## Deliverables

- `/mnt/documents/bonki-pricing-model.pdf`
- `/mnt/documents/bonki-ux-architecture.pdf`

Both surfaced via `<lov-artifact>` tags.
