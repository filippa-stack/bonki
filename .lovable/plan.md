## Apple Guideline 3.1.1 Compliance Hardening (Build 1.0 (7))

Approved scope from prior plan. Implementing all 5 changes.

### Changes

**1. `src/components/ProductPaywall.tsx`**
- Add `Capacitor` + `purchaseProduct` + `toast` imports.
- In `handlePurchase`, branch on `Capacitor.isNativePlatform()`:
  - Native: call `purchaseProduct(product.id)`. On `cancelled` → silent return. On `!success` → show Swedish error. On success → `toast.success` + `onAccessGranted()`.
  - Web: existing Stripe `create-checkout` flow unchanged.

**2. `src/components/PurchaseScreen.tsx`** (Still Us)
- Same native-branch pattern in `handlePurchase`. Native → `purchaseProduct('still_us')` → `onPurchaseComplete()`. Web unchanged.

**3. `src/pages/BuyPage.tsx`**
- `handleDirectCheckout`: early-return + redirect to `/login` if `Capacitor.isNativePlatform()`.
- Unauthenticated render branch: if `Capacitor.isNativePlatform() && !user`, render minimal "Logga in för att fortsätta" surface routing to `/login`. Reviewer never sees Stripe-styled CTA.

**4. `src/components/ProductIntro.tsx`**
- Replace trust line "Säker betalning · Ingen prenumeration" with "Köp via App Store" when `Capacitor.isNativePlatform()`.

**5. `src/pages/BuyPage.tsx`** (RevenueCat error UX)
- In the authenticated checkout-error state, add a secondary "Tillbaka" button that navigates to `/product/${product.slug}` so a reviewer always has an escape.

### Verification
- `bunx tsc --noEmit`
- `rg -n "create-checkout" src/` — confirm only web-branch sites remain
- Confirm RevenueCat path is reachable from both ProductIntro CTA → BuyPage and ProductPaywall CTA on native.
