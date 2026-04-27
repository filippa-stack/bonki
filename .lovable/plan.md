## Replace `src/pages/PrivacyPolicy.tsx`

Overwrite the existing privacy policy page (`/privacy`) with the new uploaded version (`PrivacyPolicy_1.tsx`, 172 lines).

### What changes
The new policy expands the existing one to meet App Store / Apple Sign-In / RevenueCat / GDPR requirements for the iOS submission. Key additions:

- **Personuppgiftsansvarig**: Bonki & Friends AB (replaces "Bonki Studio")
- **Date stamp**: Updated to 27 april 2026
- **Medical disclaimer** (intro): Not a medical product; references BUP, 1177
- **Apple Sign-In coverage**: Private relay email, anonymized "sub" identifier
- **In-App Purchases**: Apple + RevenueCat as processors (USA, SCC)
- **Section 3 — GDPR Art. 6 legal basis**: Avtal / berättigat intresse / rättslig förpliktelse / samtycke
- **Section 6 — Lagringstid**: Konto, köp 7 år, loggar 90 dagar, radering
- **Section 7 — Rättigheter**: Adds IMY (tillsynsmyndighet) link
- **Section 8 — Radera ditt konto**: Documents in-app deletion + Apple token revoke + appleid.apple.com fallback
- **Section 9 — Återställ köp (iOS)**: New
- **Section 10 — Barn**: No tracking/ads for children, parental notice
- **Section 12 — Spårning**: Explicit "no ATT, no ads"
- **Section 13 — Internationella överföringar**: SCC / GDPR Ch. V
- **Section 14 — Säkerhetsincidenter**: 72h IMY notification
- New **Underbiträden list**: Supabase, Stripe, Apple, RevenueCat, Resend

Visual design (`#0B1026` background, `#D4943A` headings, `Section` helper component, layout) is unchanged — drop-in replacement of the same component shape and route.

### Steps

1. Overwrite `src/pages/PrivacyPolicy.tsx` with the uploaded file's exact contents (172 lines).
2. Run `bunx tsc --noEmit` to confirm no TypeScript regressions.
3. Update `mem://legal/privacy-policy-details` to reflect the new controller (Bonki & Friends AB), the expanded sections, and the date (27 april 2026).

### Out of scope
- No route, navigation, or styling changes elsewhere.
- No copy edits to the uploaded text — used verbatim.
- No changes to `KontoSheet.tsx`, `delete-account` edge function, or the privacy manifest (already shipped in the previous build).
