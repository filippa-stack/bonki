# Google Play rejection — final plan v4 (Prompt 2: 8-file CTA wrap)

**Status:** Prompt 1 already shipped (`isAndroidNative()` helper + Login.tsx header/placeholder rename). Re-issuing v4 to unlock the rest.

## Reviewer block visibility note (no action needed)

The "Recensentinloggning — Store Review" section is gated by `isReviewerMode = searchParams.get('review') === '1' || Capacitor.isNativePlatform()` on `Login.tsx:36`. In the **web preview** neither condition is true, so the block is correctly hidden. The Play reviewer sees it on the **native Android build** because `Capacitor.isNativePlatform()` is true there. To eyeball the web preview, append `?review=1`. **Do not change this gate** — it's working as designed.

## What this prompt does

Wrap the Buy CTA in **7 files** (8 CTAs — CardView has two) so when `isAndroidNative()` is true, a plain-text neutral message replaces the button. The `handlePurchase` / `handleDirectCheckout` / `handleCompletionPurchase` handlers are not touched. No links, no `bonkiapp.com`, no `<a>` tags anywhere.

### Files & wrap points

| # | File | CTA line | Wraps |
|---|------|----------|-------|
| 1 | `src/components/PurchaseScreen.tsx` | 293–313 | `<button onClick={handlePurchase}>` |
| 2 | `src/components/PaywallBottomSheet.tsx` | 371–393 | `<button onClick={handlePurchase}>` |
| 3 | `src/components/ProductPaywall.tsx` | 445–468 | `<button onClick={handlePurchase}>` |
| 4 | `src/pages/Paywall.tsx` | 245–263 | `<motion.button onClick={handlePurchase}>` |
| 5 | `src/pages/PaywallFullScreen.tsx` | 291–312 | `<button onClick={handlePurchase}>` |
| 6 | `src/pages/BuyPage.tsx` | 452–461 | `<button onClick={handleDirectCheckout}>` |
| 7 | `src/pages/CardView.tsx` | 1561–1584 | `<button onClick={handleCompletionPurchase}>` (kids completion) |
| 8 | `src/pages/CardView.tsx` | 1948–1971 | `<button onClick={handleCompletionPurchase}>` (Still Us completion) |

### Wrap pattern (verbatim)

```tsx
{isAndroidNative() ? (
  <div
    style={{
      width: '100%',
      padding: '16px 20px',
      borderRadius: '12px',
      background: 'rgba(255,255,255,0.06)',
      color: 'rgba(253, 246, 227, 0.75)',
      fontFamily: 'var(--font-sans)',
      fontSize: 14,
      lineHeight: 1.5,
      textAlign: 'center',
    }}
  >
    Köp är inte tillgängliga i Android-versionen just nu. Vi arbetar på det. Logga in med samma konto för att låsa upp produkter du redan äger.
  </div>
) : (
  /* existing CTA — unchanged */
)}
```

Each file also gets one new import line: `import { isAndroidNative } from '@/lib/platform';` next to the existing `purchaseProduct` import.

### Hard rules (verbatim, do NOT relax)

- Do **NOT** turn any text into an `<a>`, `<Link>`, button, or any other link, anywhere.
- Do **NOT** add an "Open in browser" or "Köp på webben" button.
- Do **NOT** mention `bonkiapp.com`, `bonki.lovable.app`, or any URL — that omission is intentional under Google Play's payments policy (no out-of-app steering for digital goods).
- Do **NOT** modify `handlePurchase`, `handleDirectCheckout`, or `handleCompletionPurchase` — only wrap the rendered CTA element.
- Do **NOT** change anything outside the 7 listed files.
- Where the existing button has trailing siblings (error `<p>`, dismiss button, terms text), leave those siblings outside the ternary so they still render on Android.

## Manual steps still pending (unchanged from original v4)

- **Section 4** — Provision `play.review@bonkistudio.com` / `BonkiPlay2026` in Lovable Cloud Users (Live), then run the 7-row `INSERT … manual_grant` for `user_product_access`.
- **Section 5** — Paste the English-first App Access text into Play Console.
- **Post-ship checklist** — `.env.local` Live grep, `npm run build`, bundle URL grep (must contain `spgknasuinxmvyrlpztx`, must NOT contain `wcienwozdurwhswaarjy`), `npx cap sync android`, `versionCode: 2 → 3`, signed AAB, upload.
- **Smoke test in Android emulator** — reviewer login (full access), throwaway no-grant account (neutral message appears, no Buy button, no `bonkiapp.com`), KontoSheet "Radera konto" reachable, logout/re-login. `adb logcat *:E Capacitor:V` running to catch any `@capgo/capacitor-social-login` init errors.

## Out of scope (logged)

- Play Billing integration → 1.0.1.
- Stripe-in-Android-WebView validation → only if/when re-enabled.
- iOS resubmission → calendar note: next iOS archive will display the renamed "Store Review" header (improvement, not regression).
