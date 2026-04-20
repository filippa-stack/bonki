
## Convert ProductIntro into a Conversion Surface (v2 — approved)

**File:** `src/components/ProductIntro.tsx` (only file touched)

### Why
Since the April 17 purchase-first launch: 12 logged-in users → 19 product intros viewed → 0 purchases. The intro reads like a session opener, not a sales surface. No price, no scope, no credibility, no preview, no CTA telemetry.

### Changes (5 edits, all in `ProductIntro.tsx`)

**1. Imports + price fetch + CTA telemetry**
- Import `trackPixelEvent` from `@/lib/metaPixel`.
- Add `priceSek` state + `useEffect` reading `price_sek` from the `products` table (matches `ProductPaywall.tsx` / `BuyPage.tsx`). Fallback: `249` for `still_us`, `195` otherwise.
- In `handleCta`: fire `trackPixelEvent('InitiateCheckout', { value, currency: 'SEK' })` and insert an `onboarding_events` row with `event_type: intro_cta_clicked_<productId>`. Wrapped in try/catch — telemetry never blocks navigation.

**2. Price-explicit CTA label**
- From: `Lås upp ${product.name}` (ambiguous)
- To: `Köp ${product.name} · ${priceSek} kr` (falls back to `Köp ${product.name}` while loading)

**3. Per-product preview question constant**
- Add `PREVIEW_QUESTION` record near `SHORT_INTROS`, with one handpicked question per product (jag_i_mig, jag_med_andra, jag_i_varlden, syskonkort, vardagskort, sexualitetskort, still_us). Chosen as proof-of-craft.

**4. Insert preview-question + offer-details blocks between body and CTA**
Two additive blocks placed after body paragraphs and before the CTA `motion.div`:
- **Preview**: small uppercase label `En fråga ur samtalen` + the quoted question rendered in `var(--font-serif)` at 17px, weight 400 (no italic — clean serif voice on the dark bg).
- **Offer details** (3 lines, reusing approved copy from `ProductPaywall.tsx` / `PaywallBottomSheet.tsx`):
  - Scope: `{n} samtal · {k} kategorier`
  - Price: `{price} kr · Engångsköp · Tillgång för alltid`
  - Credibility: `Utvecklat tillsammans med psykolog · 25 års klinisk erfarenhet`

Both blocks use existing typography tokens (LANTERN_GLOW, dimmed opacity), tightly stacked.

**5. Trust line below CTA**
- `Säker betalning · Ingen prenumeration` — placed between the CTA button and the existing `Inte just nu` skip link. Mirrors `ProductPaywall.tsx`.

### Explicitly NOT touched
- `handleCta` navigation target → still `/buy?product=${productId}`
- `useProductIntroNeeded` hook
- `markProductIntroSeenServer` + `product_intro_seen_*` event type
- `bonki-intro-seen-${productId}` localStorage key
- `ProductHome.tsx` tri-state `showIntro` machine
- Back button, illustration zone, Sexualitet `sexSafetyLine`, "Inte just nu" skip link
- Order/placement of existing JSX — all new blocks are additive

### Measurement (post-ship)
Intro→checkout conversion: count `onboarding_events` with `event_type LIKE 'intro_cta_clicked_%'` against `product_intro_seen_%` per product. Meta Pixel `InitiateCheckout` will surface the funnel in Ads Manager.
