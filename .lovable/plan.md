

## Prompt 3 of 3: Flip BuyPage unauthenticated flow to Stripe-first

This is the final prompt that activates the website-direct Stripe-first architecture. After this ships, visitors arriving from bonkistudio.com pay Stripe before logging in, then verify via OTP on `/claim` (built in Prompt 2).

### Risk profile

Highest risk of the three prompts — touches a live, revenue-critical flow. The authenticated branch (in-app users tapping tiles) must remain byte-identical in behavior. Only the unauthenticated render branch is rewritten.

### Files touched

1. `src/pages/BuyPage.tsx` — four contained edits, all inside the existing component.

No other files. No backend changes. No new routes. No edge function deploys.

### What changes (all in `BuyPage.tsx`)

**1. New state + cancel-return detection** (after the existing checkout state block)

Add three pieces of state without touching any existing declarations:
- `directCheckoutLoading` / `directCheckoutError` — drive the new "Köp" button's loader and error display.
- `isCancelReturn = searchParams.get('cancelled') === '1'` — true when Stripe redirected the user back via the cancel URL. Used to break the auto-trigger loop.

The existing `email`, `otpSent`, `otpCode`, `loading`, `verifying`, `error`, `resendCooldown`, `cooldownRef`, `termsAccepted`, `termsError`, `checkoutLoading`, `checkoutError`, `checkoutTriggered`, `priceSek` all remain. `handleEmailSignIn`, `handleVerifyOtp`, `handleResend`, `saveConsent` remain defined but unreferenced by the new render — kept to avoid collateral damage and because removing them risks accidental side effects.

**2. Guard the authenticated auto-trigger against cancel return**

The existing `useEffect` that auto-triggers `triggerCheckout()` for logged-in users currently re-fires the moment a user taps Stripe's back arrow — slingshotting them straight back to Stripe. Add one early-return:

```ts
if (isCancelReturn) return; // User tapped back from Stripe — don't slingshot them
```

Add `isCancelReturn` to the dependency array. No other change to this effect.

**3. Add `handleDirectCheckout` callback** (placed right after `triggerCheckout`)

A new unauthenticated-flow checkout handler:
- Enforces `termsAccepted` first (sets `termsError` if missing, no redirect).
- Persists legal consent to `localStorage` under `pending-legal-consent` (same key/format `handleEmailSignIn` used) so `Index.tsx`'s post-auth migration picks it up after the user verifies on `/claim`.
- POSTs to `create-checkout` **with no Authorization header** — Prompt 1's edge function already supports this branch.
- Sends `successUrl: ${origin}/claim?session_id={CHECKOUT_SESSION_ID}&product=${productId}` — Stripe substitutes `{CHECKOUT_SESSION_ID}` server-side; do not URL-encode the braces.
- Sends `cancelUrl: ${origin}/buy?product=${productId}&cancelled=1` — the flag the new useEffect guard listens for.
- On `!res.ok` → set `directCheckoutError` (503 → "Betalning är inte konfigurerad ännu. Kontakta oss!", otherwise `json.error` or generic), clear `pending-legal-consent`, stop the loader.
- On success → `window.location.href = json.url`.
- Wrapped in try/catch for network failures.

Dependencies: `[productId, directCheckoutLoading, termsAccepted]`.

**4. Sync `triggerCheckout`'s cancel URL** (one-line change)

Update the authenticated flow's `cancelUrl` from `${origin}/buy?product=${productId}` to `${origin}/buy?product=${productId}&cancelled=1` so the cancel-loop fix protects in-app users too.

**5. Rewrite the unauthenticated render branch**

Replace the entire current "Login form" branch (selling surface + email form + OTP input + resend, ~140 lines) with a lean website-direct surface:

- **Product hero** — `Du köper` eyebrow → product name (24px display, was 22px) → tagline. Same content, slightly larger headline for direct-to-purchase prominence.
- **Preview question** — wrapped in a soft card (`bg rgba(253, 246, 227, 0.06)`, `border rgba(253, 246, 227, 0.10)`, `radius 14px`) instead of bare centered text. Eyebrow + serif quote inside. Brings it closer to ProductIntro styling.
- **Offer details** — divider above (`border-top: 1px solid rgba(253, 246, 227, 0.12)`), four lines: scope, price + scope, psychologist credibility, payment trust. Identical copy to current.
- **TermsConsent** — same component, same Bonki Orange link styling override, same error message.
- **Köp CTA** — single full-width Bonki Orange pill (`ORANGE_GRADIENT` + `ORANGE_SHADOW`). Label: `Köp ${product.name} · ${priceSek} kr` (or just `Köp ${product.name}` until price loads). Spinner state during redirect.
- **Recovery link** — small text button `Har du redan köpt? Logga in →` → `/login`. Critical safety net for purchasers whose state cleared.
- **Error display** — `directCheckoutError` shown below the recovery link in coral red.

The OTP-sent state, OTP input, verify button, resend cooldown UI, "Tillbaka" button, and email input are all removed from the render — they belong to the deprecated pre-purchase OTP flow.

### What is NOT touched

- The authenticated "Förbereder betalning…" loader branch (user is logged in) — identical behavior, identical look.
- The "Invalid product" branch.
- `priceSek` fetch from `products`.
- Body of `triggerCheckout` other than the one URL change.
- `handleEmailSignIn`, `handleVerifyOtp`, `handleResend`, `saveConsent`, `cooldownRef`, `startCooldown` — left defined as dead code. Safer than deleting.
- `TermsConsent`, `TERMS_VERSION`, `PRIVACY_VERSION` imports — `TermsConsent` is now used by the new render; the version constants are used by `handleDirectCheckout`'s consent persistence.
- `ClaimPage.tsx`, `App.tsx`, all edge functions, `LibraryResumeCard.tsx`, regression guards.

### Deployment guidance

Do not publish on a Friday afternoon. Pick a window when support is alert — Monday or Tuesday morning ideal. After publish:

1. **In-app authenticated flow (must be byte-identical)** — log in, tap any locked product tile → `/buy?product=X` → confirm "Förbereder betalning…" loader appears within ~200ms and Stripe loads. This is the existing-customer regression test.

2. **Stripe cancel loop fix (authenticated)** — on the Stripe page, tap the back arrow. Confirm you land on `/buy?product=X&cancelled=1` and **stay there** with the new selling surface visible — no slingshot back to Stripe.

3. **Website-direct unauthenticated flow** — open `/buy?product=jag_i_mig` in an incognito window. Confirm:
   - New selling surface renders (hero, preview question card, offer block, TermsConsent, single orange "Köp Jag i Mig · 195 kr" button, recovery link).
   - Tapping "Köp" without checking terms → red error message under the checkbox; no redirect.
   - Checking terms + tapping "Köp" → button shows spinner, redirects to Stripe within ~1s.
   - On Stripe, tap back arrow → land on `/buy?product=jag_i_mig&cancelled=1` with selling surface intact, no slingshot.

4. **Full Stripe-first purchase** — complete a real Live purchase end-to-end with a fresh email. After payment: land on `/claim?session_id=cs_live_...&product=jag_i_mig`, ClaimPage renders, OTP arrives, verify, product unlocks, Meta Pixel `Purchase` event fires once.

5. **Recovery link** — from the new selling surface, tap "Har du redan köpt? Logga in →" → confirm `/login` loads cleanly.

### Rollback

One file. Single revert. The authenticated flow's cancel URL change is benign on its own, so even a partial revert is safe.

### Memory updates after verification

Once Prompt 3 is verified end-to-end on Live, update `mem://payment/digital-integration-strategy` to document the Stripe-first flow:
- Website-direct: `/buy` → Stripe (no auth) → `/claim` → OTP → unlock.
- In-app: tile tap → `/buy` (authenticated) → auto-trigger Stripe → success URL → unlock.
- Cancel-loop guard: `?cancelled=1` query param suppresses authenticated auto-trigger.
- Consent persistence: `pending-legal-consent` localStorage key bridges pre-Stripe checkbox to post-OTP user creation via `Index.tsx` migration.

