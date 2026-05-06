## Kids product price: 195 → 199 kr

Single price field is the source of truth: Supabase `products.price_sek`. Checkout dynamically computes `unit_amount = price_sek * 100` (`supabase/functions/create-checkout/index.ts:108`), so updating the DB row also updates what Stripe charges. **No `stripe_price_id` is set on any product row** — there's no preconfigured Stripe Price object that could drift out of sync. No Stripe dashboard work required.

### Changes

**1. DB migration** — bump all kids products from 195 → 199, leave `still_us` at 249:
```sql
UPDATE public.products SET price_sek = 199
WHERE id IN ('jag_i_mig','jag_med_andra','jag_i_varlden','vardagskort','syskonkort','sexualitetskort');
```

(Note: the spec lists "Närhet & Intimitet" as a separate product. The DB has no such row — `sexualitetskort` is the only intimacy-themed product. No additional row to update.)

**2. Code fallback constants** — every place a hardcoded `195` is used as the kids fallback when the DB fetch hasn't returned yet, change to `199`:
- `src/pages/KidsCardPortal.tsx`
- `src/pages/BuyPage.tsx`
- `src/pages/CardView.tsx`
- `src/pages/PaywallFullScreen.tsx`
- `src/components/ProductPaywall.tsx`
- `src/components/ProductIntro.tsx`

Pattern: `data?.price_sek ?? (productId === 'still_us' ? 249 : 195)` → `… : 199)`.

`still_us` 249 fallback unchanged. `OnboardingMock.tsx` price row was already removed in earlier work — no change there.

### Verification
- `psql` shows kids = 199, still_us = 249.
- Intro/paywall/buy pages show "199 kr" for kids products.
- Vårt Vi intro still shows 249 kr.
- A test checkout for a kids product creates a Stripe session with `unit_amount: 19900`.

### Files affected
- New migration updating `products.price_sek`
- 6 source files for the fallback constant
