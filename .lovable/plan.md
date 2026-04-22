

## Implement native iOS purchase flow via RevenueCat

The previous prompt wired RevenueCat init/logout. This adds the actual purchase: on native iOS, tapping "Köp" opens Apple's StoreKit sheet instead of redirecting to Stripe Checkout. Web is untouched.

### Reality check on the prompt's pseudocode

The prompt's snippet for `BuyPage.tsx` is illustrative, not literal. The real file doesn't have a `handlePurchase` — it has two distinct entry points:

1. **`triggerCheckout`** — auto-fires when an authenticated user lands on `/buy?product=…` (the path the in-app paywall buttons use after login).
2. **`handleDirectCheckout`** — fires when an unauthenticated visitor (website-direct flow) clicks "Köp"; Stripe collects email itself, post-payment lands on `/claim`.

For **native iOS**, only `triggerCheckout` is relevant: the user must already be logged in for RevenueCat to associate the purchase with their Supabase user id (via `appUserID` set in prompt 1). The unauthenticated `handleDirectCheckout` path stays Stripe-only — there's no "logged-out" purchase flow on native because the App Store requires an authenticated app session anyway, and our paywalls already gate on auth.

Two more deviations from the pseudocode I'm correcting:

- **No `queryClient.invalidateQueries(['userProductAccess'])`.** `useProductAccess` and `useAllProductAccess` use plain `useState`/`useEffect`, not React Query. Invalidating that key is a no-op. Instead, after a successful purchase we'll navigate to `/product/{slug}` — the destination remounts and the hook re-queries. (Prompt 4 will add a proper webhook + entitlement-refresh pattern; for now, navigation is enough.)
- **`navigate(\`/product/${productId}\`)`** in the pseudocode uses the raw product id (`jag_i_mig`), but routes use the **slug** (`product.slug`). Existing code in `triggerCheckout` already navigates with `product?.slug ?? productId` on the `already_purchased` path — we'll mirror that.

### Changes (3 total)

**1. Extend `src/lib/revenueCat.ts`** — append the `purchaseProduct` function exactly as specified, plus the `PurchaseResult` interface. `Capacitor` is already imported at the top from prompt 1; just add the `CustomerInfo` type and the `Purchases` value import (already imported). The function:
- Returns `{ success: false, cancelled: false, error: 'Not a native platform' }` on web — never throws.
- Calls `Purchases.getOfferings()`, picks `current`, finds the package whose `identifier` equals the Supabase product id, calls `Purchases.purchasePackage({ aPackage: pkg })`.
- Distinguishes user cancel (`err.userCancelled === true`) from real errors.

This requires the RevenueCat dashboard to have an Offering marked "current" with packages whose **identifiers exactly match** our Supabase product ids (`jag_i_mig`, `jag_med_andra`, `jag_i_varlden`, `vardagskort`, `syskonkort`, `sexualitetskort`, `still_us`). That's a dashboard config step, not a code step — prompt 3 or 4 will likely cover it. If the offering isn't configured yet, `purchaseProduct` returns a clear error and we fall back to the existing error UI.

**2. Add native branch to `src/pages/BuyPage.tsx`** — inside `triggerCheckout`, before the existing `fetch('…/create-checkout', …)` call. New imports at the top: `import { Capacitor } from '@capacitor/core'` and `import { purchaseProduct } from '@/lib/revenueCat'` and `import { toast } from 'sonner'`. Then inside `triggerCheckout` (after the `session.access_token` guard, before the `fetch`):

```ts
if (Capacitor.isNativePlatform()) {
  const result = await purchaseProduct(productId);

  if (result.cancelled) {
    // User tapped Cancel in Apple's sheet — silently reset, no toast
    checkoutTriggered.current = false;
    setCheckoutLoading(false);
    return;
  }

  if (!result.success) {
    setCheckoutError('Köpet kunde inte genomföras. Försök igen.');
    checkoutTriggered.current = false;
    setCheckoutLoading(false);
    return;
  }

  toast.success('Tack för ditt köp!');
  // Navigate to product home — useProductAccess will re-query on mount.
  // RevenueCat webhook (prompt 4) will write to user_product_access server-side.
  navigate(`/product/${product?.slug ?? productId}`, { replace: true });
  return;
}

// Existing Stripe flow continues unchanged below…
```

Two small refinements vs. the prompt's pseudocode, matching this file's existing patterns:
- Use `setCheckoutError(...)` instead of `toast.error(...)` for failures — the existing "Förbereder betalning…" loading screen already renders `checkoutError` with a "Försök igen" button. Consistent UX, no duplicated error surface.
- Reset `checkoutTriggered.current = false` on cancel/error so the user can retry (mirrors how the existing Stripe error path resets it).
- `toast.success(...)` for the win path is fine — Sonner is already mounted in `App.tsx`.

`handleDirectCheckout` stays Stripe-only and unchanged — it's the unauthenticated website flow, never reachable from a native app session.

**3. Confirm zero edits to paywall components.** `ProductPaywall.tsx`, `PaywallFullScreen.tsx`, `PaywallBottomSheet.tsx`, `Paywall.tsx` all just navigate to `/buy?product=…`. The native branch lives entirely inside `BuyPage.tsx`, so they need no changes.

### Not touching
- `CardView.tsx`, `useSessionReflections.ts`, `useNormalizedSessionState.ts`
- `capacitor.config.ts`
- `create-checkout` edge function, `stripe-webhook`, any Stripe code
- All paywall components
- `useProductAccess.ts` / `useAllProductAccess.ts` (refactor to React Query is out of scope; navigation triggers a re-query naturally)

### Verification

- **Web** (`Capacitor.isNativePlatform() === false`): the `if (Capacitor.isNativePlatform())` block is skipped; existing Stripe `fetch` runs exactly as today. No behavior change.
- **iOS native**:
  - Authenticated user taps "Köp" on any paywall → routes to `/buy?product=jag_i_mig` → `triggerCheckout` fires → Apple's native purchase sheet appears (no Stripe redirect, no Safari handoff).
  - Confirm purchase in sandbox → `toast.success('Tack för ditt köp!')` → navigates to `/product/jag-i-mig`.
  - Cancel in Apple sheet → silently returns to the BuyPage shell, no error toast, user can retry.
  - Failure (e.g., offering misconfigured) → "Köpet kunde inte genomföras. Försök igen." in the existing checkout-error surface with the existing retry button.
- **No UI changes on web. No paywall component changes. Stripe path bit-identical.**

### Known follow-ups (deferred to prompts 3 & 4)
- RevenueCat dashboard: create an Offering with packages identified by Supabase product ids.
- Server-side entitlement sync via RevenueCat webhook → `user_product_access`.
- Restore Purchases UX (for users reinstalling the app).
- Android (`Purchases.configure` for Play, plus Google API key in `revenueCat.ts`).

