

## Prompt 3.1 — Two BuyPage UX fixes

Both fixes contained to `src/pages/BuyPage.tsx`. No other files, no backend, no routes.

### Change 1: Route authenticated cancel-returns to the product intro

A logged-in user tapping Stripe's back arrow currently lands on the unauthenticated `/buy?cancelled=1` selling surface — which feels like a login page when you're already logged in. Detect "authenticated + cancel-return" and redirect them to `/product/:slug` instead, where they came from.

In the existing auto-trigger `useEffect`, replace the single `if (isCancelReturn) return;` early-return with a two-branch guard:
- **Authenticated + cancel-return** → `navigate(/product/${product.slug}, { replace: true })` and return. `replace` prevents the back button from looping them back into `/buy`.
- **Unauthenticated + cancel-return** → return early (preserves the current correct behavior — cold visitors stay on the selling surface, which is their commit page).
- **Otherwise** → existing auto-trigger logic unchanged.

`navigate` is already imported and in scope from the unauthenticated render. Add it to the dep array alongside the existing deps.

### Change 2: Make the Terms checkbox visible on dark navy

The shadcn `<Checkbox>` inside `TermsConsent` uses default borders that disappear against `MIDNIGHT_INK`. Edit only the wrapper `<div>` around `<TermsConsent>` in BuyPage's new unauthenticated render — don't touch the shared `TermsConsent` component (the Login page uses it on a different background).

Extend the existing arbitrary-variant `className` with four selectors targeting `[role=checkbox]`:
- **Unchecked**: `border-[rgba(253,246,227,0.45)]` (cream at 45%) + `bg-[rgba(253,246,227,0.05)]` (cream at 5%) — visible without being loud.
- **Checked** (`[data-state=checked]`): `bg-[#E85D2C]` + `border-[#E85D2C]` — Bonki Orange, matches the Köp CTA, gives clear tap confirmation.

Existing label/link/button color overrides preserved as-is.

### What is NOT touched

- `src/components/TermsConsent.tsx` — unchanged; other callers (Login) unaffected.
- Authenticated auto-trigger when *not* a cancel-return — behaves identically.
- Unauthenticated cancel-return — still renders the selling surface (correct: that's their commit page).
- `triggerCheckout`, `handleDirectCheckout`, `handleEmailSignIn`, etc. — all untouched.
- `ClaimPage.tsx`, `App.tsx`, edge functions, regression guards.

### Verify

1. **Authenticated cancel** — log in, tap a locked tile → Stripe → back arrow. Expect: land on `/product/:slug` (intro page), not `/buy?cancelled=1`. Back button doesn't loop into `/buy`.
2. **Unauthenticated cancel** — incognito `/buy?product=jag_i_mig` → tap Köp → Stripe → back. Expect: land on `/buy?cancelled=1` showing the selling surface, no slingshot.
3. **Checkbox visible** — incognito `/buy?product=X`. Expect: checkbox has a clearly visible cream-tinted border on the dark background, even when unchecked. Tapping it fills with Bonki Orange.
4. **In-app authenticated purchase still works** — log in, tap locked tile → "Förbereder betalning…" loader → Stripe loads. Unchanged.

### Rollback

One file. Two small hunks. Either change can be reverted independently.

