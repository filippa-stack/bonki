

## Add `/claim` page for post-purchase OTP verification

A new public route that website-direct purchasers will land on after Stripe checkout (Prompt 3 will wire `success_url` to it). Page is unreachable from normal user flow after this deploy — verified manually with a real Live session ID.

### Files touched
1. `src/pages/ClaimPage.tsx` — new file
2. `src/App.tsx` — add public route + import

### What gets built

**1. `src/pages/ClaimPage.tsx` (new)**

A self-contained page with three states driven by a `lookup` state machine:

- **Loading state**: shown while calling the existing `get-purchase-session` edge function. Centered `Loader2` spinner on `MIDNIGHT_INK` background.
- **Error state**: shown if `session_id` is missing, lookup fails, or response is incomplete. Displays a Swedish error message + "Gå till inloggning →" link to `/login`.
- **Ready state (main UI)**:
  - "Tack för ditt köp!" pill with a `Check` icon at the top.
  - Heading: "Ett steg kvar — bekräfta din e-post för att få tillgång till {productName}".
  - Subtext: "Vi skickar en engångskod till {email}. Fyll i koden nedan för att logga in — ditt köp är redan sparat."
  - Initial CTA: Bonki Orange pill button "Skicka engångskod" (uses the same `ORANGE_GRADIENT` + `ORANGE_SHADOW` system as `BuyPage`).
  - After OTP sent: 6-digit OTP input (numeric only, large centered text, `0.5em` letter spacing) + "Logga in och öppna {productName}" submit button + "Skicka mejlet igen" resend link with 60s cooldown timer.

Behaviors:
- On mount: `usePageBackground(MIDNIGHT_INK)` to lock the shell color.
- On mount: `fetch` POST to `${VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/get-purchase-session` with `{ sessionId }` to retrieve `email`, `productId`, `paid`.
- If `paid === true`: fire `trackPixelEvent('Purchase', { value, currency: 'SEK' })` once per session via `purchaseTrackedRef`. Value: `249` for `still_us`, `195` otherwise.
- Send OTP via `supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })`.
- Verify OTP via `supabase.auth.verifyOtp({ email, token, type: 'email' })`.
- On successful verification: `navigate(`/product/${product.slug}`, { replace: true })` if product resolved, else `navigate('/', { replace: true })`.
- Resend cooldown: 60s countdown via `setInterval`, cleared on unmount.
- Errors surface in a small error block under the form, in Swedish.
- All copy in Swedish, follows `mem://style/ni-form-shift` and `mem://localization/language-and-localization`.

Imports used:
- `supabase` from `@/integrations/supabase/client`
- `getProductById` from `@/data/products`
- `MIDNIGHT_INK`, `LANTERN_GLOW` from `@/lib/palette`
- `usePageBackground` from `@/hooks/usePageBackground`
- `trackPixelEvent` from `@/lib/metaPixel`
- `Loader2`, `Check` from `lucide-react`

**2. `src/App.tsx`**

Two additions:
- Import: add `import ClaimPage from "./pages/ClaimPage";` next to the existing `import BuyPage from "./pages/BuyPage";`.
- Route: add `<Route path="/claim" element={<ClaimPage />} />` inside `AppRoutes`, alongside `/buy` and `/privacy` (above the catch-all `<Route path="/*" element={<ProtectedRoutes />} />`).

This keeps `/claim` outside the `ProtectedRoutes` tree — it's a public route, since unauthenticated users are exactly who land here. It still inherits `MobileOnlyGate` from the wrapping tree.

### What is NOT touched
- `BuyPage.tsx` — untouched.
- `ProtectedRoutes`, `ProtectedContent`, any existing route — untouched.
- `Index.tsx` purchase-success handler — still handles the in-app flow.
- Any edge function — untouched (Prompt 1's `get-purchase-session`, `stripe-webhook`, etc. remain as-is).
- `AuthProvider`, `SiteSettingsProvider`, `MobileOnlyGate` — untouched.
- `useSessionReflections.ts`, `CardView.tsx` — regression guards preserved.
- `AnimatePresence` mode, `key={location.pathname}` policy, `100dvh` rule — all preserved.

### How to verify after deploy
The page is not linked anywhere. Test with a real Live Stripe session ID:

1. **Error path**: `/claim` (no `session_id`) → expect Swedish error message + login link.
2. **Error path**: `/claim?session_id=cs_live_invalid` → expect "Kunde inte hitta ditt köp." error.
3. **Happy-path UI verification (Live session, no OTP submission)**:
   - On phone, visit:
     `https://bonkiapp.com/claim?session_id=cs_live_a1q4FBZPcy42bVjgYeJxzYlFvzhvilxWF6FsHipK0gjF1Yh2aWAyaZAJsC&product=jag_i_varlden`
     (Ida Welbourn's confirmed Live Jag i Världen purchase from Prompt 1 testing.)
   - Expect: loading spinner briefly → "Tack för ditt köp!" pill → heading naming Jag i Världen → email shown → "Skicka engångskod" pill in Bonki Orange.
   - Tap "Skicka engångskod" → expect transition to OTP-sent state: 6-digit input field, "Logga in och öppna Jag i Världen" submit button, "Skicka mejlet igen (60s)" cooldown link, "Hittar du inte mejlet? Kolla din skräppost." helper text.
   - **Do NOT enter a code.** Goal is UI verification only — full OTP completion path is tested in Prompt 3 with a genuine new purchase.
   - Verify Meta Pixel `Purchase` event fires once (Pixel Helper) since `paid: true` on this Live session.

### Revert cost
Two files. One revert click on each.

### Memory updates
None yet — Prompt 3 wires this into the live purchase flow. Wait until the full flow is end-to-end to capture a memory under `mem://payment/digital-integration-strategy` documenting the OTP-after-purchase claim flow.

