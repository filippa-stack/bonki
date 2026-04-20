
## Apply intro-style selling surface to BuyPage (v2 — approved with edits)

**Files touched:**
- `src/lib/productPreviewQuestions.ts` (new — shared constant)
- `src/components/ProductIntro.tsx` (swap inline const for import)
- `src/pages/BuyPage.tsx` (add selling surface to pre-OTP state)

### Why
Visitors arriving from bonkistudio.com bypass the in-app `ProductIntro` and land directly on `/buy?product=X`. Today that page shows only "Du köper / {name} / {price · cards · Engångsköp}" before the email field — no tagline, no preview, no credibility, no trust line. We mirror the selling surface already shipped on `ProductIntro`, only in the pre-OTP state.

### Changes

**1. New shared module — `src/lib/productPreviewQuestions.ts`**
Extract the existing `PREVIEW_QUESTION` map (currently inline in `ProductIntro.tsx`) into a single source of truth so both surfaces always show the same question per product.

**2. `src/components/ProductIntro.tsx`**
- Remove the inline `PREVIEW_QUESTION` constant.
- Add `import { PREVIEW_QUESTION } from '@/lib/productPreviewQuestions';`
- No other logic changes.

**3. `src/pages/BuyPage.tsx` — pre-OTP state only**
- Add `import { PREVIEW_QUESTION } from '@/lib/productPreviewQuestions';`
- Replace the minimal "Du köper / name / price · cards · Engångsköp" block with:
  - **Hero**: `Du köper` eyebrow + product name + tagline (if present)
  - **Preview question** block (only if mapping exists for productId): small uppercase label `En fråga ur samtalen` + the quoted question rendered in `var(--font-serif)` at 17px, weight 400 (no italic — matches ProductIntro)
  - **Offer details** (4 lines, identical copy to ProductIntro plus trust line):
    - `{n} samtal · {k} kategorier`
    - `{price} kr · Engångsköp · Tillgång för alltid`
    - `Utvecklat tillsammans med psykolog · 25 års klinisk erfarenhet`
    - `Säker betalning · Ingen prenumeration` (same 13px dimmed styling, small top margin — sits inside the offer block so it survives any future email-form refactor)
- CTA label `Fortsätt` left untouched (downstream refactor will replace this button).

### Explicitly NOT touched
- CTA label on the email submit button (`Fortsätt`)
- OTP-sent state (back arrow, code input, verify button, resend cooldown)
- "Förbereder betalning…" / checkout-in-progress state
- "Invalid product" state
- `handleEmailSignIn`, `handleVerifyOtp`, `handleResend`, `triggerCheckout` bodies
- Auto-trigger checkout `useEffect` for logged-in users
- `TermsConsent` rendering and `saveConsent`
- `ORANGE_GRADIENT` / `ORANGE_SHADOW`, page background, cooldown logic
- All ProductIntro logic apart from the constant extraction

### Risk / verification
- Both surfaces import from the same module → no drift between in-app and website preview question.
- The preview block is conditional on `PREVIEW_QUESTION[productId]` so unknown product IDs render nothing instead of breaking layout.
- Trust line lives inside the offer-details block, not the form, so a future email-form refactor won't strip it.
