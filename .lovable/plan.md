## Goal

On iOS only, add a new "Lös in kod" secondary link to ProductIntro and ProductPaywall that opens Apple's native StoreKit Offer Code redemption sheet (e.g. `TACK25`). On web and Android, nothing changes.

## Scope

Exactly 3 files touched:

1. `src/lib/revenueCat.ts` — add one new exported function.
2. `src/components/ProductIntro.tsx` — add iOS-only secondary link below the primary CTA.
3. `src/components/ProductPaywall.tsx` — add iOS-only secondary link above the existing "Utforska andra produkter" link.

Nothing else is modified. Primary CTAs, Stripe routing, BuyPage, edge functions, Capacitor config, and design tokens stay byte-identical.

## Changes

### 1. `src/lib/revenueCat.ts`

Add a new export adjacent to `purchaseProduct` and `restorePurchases`. Do not modify any existing function.

```ts
export async function presentCodeRedemptionSheet(): Promise<{ success: boolean; error?: string }> {
  if (Capacitor.getPlatform() !== 'ios') {
    return { success: false, error: 'Endast tillgänglig på iOS.' };
  }
  try {
    await Purchases.presentCodeRedemptionSheet();
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Okänt fel';
    console.error('[RevenueCat] presentCodeRedemptionSheet failed:', err);
    return { success: false, error: message };
  }
}
```

The `console.error` here is the only debug surface for failures — sufficient because Apple's redemption sheet provides its own UI feedback for actual error conditions, and user dismissal also bubbles up as a thrown error (which is normal, not an error to surface).

### 2. `src/components/ProductIntro.tsx`

- Imports: add `Capacitor` from `@capacitor/core` and `presentCodeRedemptionSheet`, `restorePurchases` from `@/lib/revenueCat`.
- Below the primary "Köp …" button (around line 544, inside the sticky CTA container at `padding: '0 24px'`), conditionally render a "Lös in kod" link **only when `Capacitor.getPlatform() === 'ios'`**. On web/Android nothing additional renders — preserves current behavior (no secondary link today).
- Visual styling matches the canonical "Utforska andra produkter" link from `ProductPaywall.tsx` exactly: `font-sans`, 14px, weight 500, `LANTERN_GLOW`, opacity 0.75, underlined with `textUnderlineOffset: 3px`, padding `8px 16px`, centered with `margin: 16px auto 0`, no background/border.
- onClick handler:
  1. `const result = await presentCodeRedemptionSheet();`
  2. On `success: true`: call `restorePurchases()` (forces RC sync in case webhook is delayed), then `window.location.reload()` so the parent `ProductHome` re-runs `useProductAccess` and bypasses the intro/paywall when access is granted.
  3. On `success: false`: **do nothing in the UI.** No toast. Apple's sheet handles its own feedback, and user dismissal bubbles up as a thrown error — toasting would falsely flag normal cancellation as a failure. The `console.error` inside the wrapper is the sole debug signal.
- No loading state — Apple's sheet appears instantly with its own UI.

### 3. `src/components/ProductPaywall.tsx`

- Imports: `Capacitor` is already imported — reuse. Add `presentCodeRedemptionSheet` and `restorePurchases` to the existing `purchaseProduct` import line.
- Directly above the existing "Utforska andra produkter" button (around line 419), insert a "Lös in kod" link **only when `Capacitor.getPlatform() === 'ios'`**. Order on screen: `Lös in kod` first, then `Utforska andra produkter` below.
- Visual styling: identical to the existing "Utforska andra produkter" button on the same screen (canonical secondary-link style). Same font/size/color/opacity/spacing/tap target.
- onClick handler:
  1. `const result = await presentCodeRedemptionSheet();`
  2. On `success: true`: call `restorePurchases()` then `onAccessGranted?.()` — same handler that fires after a successful `purchaseProduct` (line 130).
  3. On `success: false`: **do nothing in the UI.** Same rationale as ProductIntro — Apple owns the feedback; user dismissal must not trigger a toast.

## Protected — DO NOT CHANGE

- Primary "Köp …" / "Lås upp …" CTAs and their `handleCta` / `handlePurchase` flows.
- `Capacitor.isNativePlatform()` guards anywhere.
- Existing `purchaseProduct`, `restorePurchases`, and bootstrap functions in `src/lib/revenueCat.ts`.
- `KontoSheet.tsx`, `PaywallBottomSheet.tsx`, `BuyPage.tsx`, `PurchaseScreen.tsx`.
- `capacitor.config.ts`, edge functions, Stripe paths, Supabase schema/RPCs.
- "Utforska andra produkter" link behavior and styling — completely unchanged.
- Content-safety disclaimers on both surfaces.
- No new dependencies (`@revenuecat/purchases-capacitor` already exposes the method).

## Web/Android verification (after deploy)

1. Open Test URL on desktop browser. Open ProductIntro for a locked product → only primary CTA renders, no secondary link (unchanged).
2. Open ProductPaywall for a locked product → only "Utforska andra produkter" renders below CTA (unchanged).
3. Click primary CTA → still navigates to `/buy?product=X`.
4. No console errors.

iOS verification of the new "Lös in kod" link must happen on the Mac/TestFlight build after publishing to Live — Lovable preview reports `web` for `Capacitor.getPlatform()`, so the iOS branch is invisible in the browser. On device: tap "Lös in kod" → Apple sheet appears → dismissing without entering a code shows no toast (correct); entering `TACK25` and confirming refreshes entitlements and unlocks the product.
