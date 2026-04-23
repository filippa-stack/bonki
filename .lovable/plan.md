

## Simplify BuyPage terms — match Login (links-only, no checkbox)

Replace the full `<TermsConsent>` checkbox block on `BuyPage` with the same `linksOnly` variant used on `Login`. Acceptance becomes implicit on tapping the orange `Köp …` CTA, just like tapping `Verifiera` on Login.

### Why

Apple's reviewer flow + paying customer flow both benefit from one less click. Legal acceptance is still captured (text + version pinning + `saveConsent()` on submit) — only the explicit checkbox is removed. Login already works this exact way; BuyPage is the last page with the heavier pattern.

### Edit — `src/pages/BuyPage.tsx` (single file)

1. **Remove state + error UI**
   - Delete `termsAccepted` and `termsError` `useState` calls (lines 42–43).
   - Delete the `termsError` `<p>` block (lines 422–426) and the wrapping checkbox `<div className="[&_label]…">` (lines 416–421).

2. **Replace with links-only consent**, placed in the same slot above the `Köp …` button:
   ```tsx
   <div style={{ marginTop: 4 }}>
     <TermsConsent
       linksOnly
       className="text-xs leading-relaxed text-center"
     />
   </div>
   ```
   Renders the same Swedish line shown on Login: *"Genom att fortsätta godkänner du våra Villkor och Integritetspolicy."* — links open the existing modal/policy pages.

3. **Drop the gate, keep the consent record**
   - In `handleDirectCheckout` (line ~188): remove the `if (!termsAccepted) { setTermsError(true); return; }` early-return. Keep the existing `saveConsent()` call so `pending-legal-consent` (with `TERMS_VERSION` / `PRIVACY_VERSION` and timestamp) is still written to `localStorage` the moment the user taps the CTA.
   - In `handleEmailSignIn` (line ~261, used by the recovery / "Logga in" sub-flow if it stays reachable): same change — remove `if (!termsAccepted) { setTermsError(true); return; }`, keep `saveConsent()`.
   - Remove `termsAccepted` from the `useEffect` dep array on line 241.

### Visual result

The block between the offer details and the orange CTA becomes one centered subdued line (`rgba(253, 246, 227, ~0.55)`) with two underlined orange links — identical typography and spacing to Login. The `Köp Syskon · 195 kr` button moves up by ~28px, tightening the page.

### Untouched

- `TermsConsent.tsx` component (the `linksOnly` mode already exists and is used by Login).
- `saveConsent()` helper, `TERMS_VERSION`, `PRIVACY_VERSION`, the `pending-legal-consent` localStorage flow, and the Stripe checkout call.
- `/villkor` and `/privacy` pages and their links.
- All other pages (Login already done, no other surface uses the BuyPage checkbox pattern).
- Pricing, copy, layout above the consent line, and the recovery `Har du redan köpt? Logga in →` link.

### Verification

1. `/buy?product=syskonkort` → consent renders as one subdued line with orange `Villkor` and `Integritetspolicy` links; no checkbox visible.
2. Tap `Köp Syskon · 195 kr` immediately → Stripe checkout starts; `localStorage['pending-legal-consent']` contains the current `TERMS_VERSION`, `PRIVACY_VERSION`, and an ISO timestamp.
3. Tap `Villkor` → terms modal/page opens; tap `Integritetspolicy` → privacy page opens.
4. `Har du redan köpt? Logga in →` still navigates to `/login`.
5. No TypeScript errors; `termsAccepted` / `termsError` references fully removed.

