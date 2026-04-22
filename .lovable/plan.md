

## Restore Purchases button in Konto-sheet

Adds the Apple-required "Återställ köp" affordance for non-consumable IAP. Server-side grants are already handled by the RevenueCat webhook from Prompt 3 — this prompt is purely client-side.

### Important: Surface clarification

The prompt says "the Settings page (the one added in the earlier 'logout + delete-account' prompt)." Searched the codebase — there is no standalone Settings page. The Logga ut + Radera konto UI lives in **`src/components/KontoSheet.tsx`**, a bottom sheet opened from `Header.tsx` (Konto icon). It also hosts Integritetspolicy and the user's email. That's the canonical "Konto" surface and the right place for "Återställ köp." No new page needed.

(`/settings/dissolve` is unrelated — it's the couple-dissolution flow, not user account settings.)

### Changes (2 total)

**1. Extend `src/lib/revenueCat.ts`** — append `RestoreResult` interface and `restorePurchases()` exactly as in the prompt. Web returns a safe no-op `{ success: false, restoredCount: 0, error: 'Not a native platform' }`. Native calls `Purchases.restorePurchases()`, returns `restoredCount = Object.keys(customerInfo.entitlements?.active ?? {}).length`. Errors caught and returned, never thrown. Mirrors the existing `purchaseProduct` pattern.

**2. Add "Återställ köp" section to `src/components/KontoSheet.tsx`** — placed **above** "Logga ut" (i.e. after the Integritetspolicy button and its divider, before the Logga ut button), only on native iOS:

- New imports: `useState` from react (already imported is `useNavigate`/`useAuth`; add `useState`), `Capacitor` from `@capacitor/core`, `restorePurchases` from `@/lib/revenueCat`, `toast` from `sonner`, `Loader2` from `lucide-react`.
- Local state: `const [restoringPurchases, setRestoringPurchases] = useState(false)`.
- Handler `handleRestorePurchases`:
  - Guard against double-tap.
  - Calls `restorePurchases()`.
  - `!success` → `toast.error('Kunde inte återställa köp. Försök igen.')`.
  - `restoredCount === 0` → `toast.info('Inga tidigare köp hittades.')`.
  - `restoredCount > 0` → `toast.success('Dina köp har återställts.')` then `setTimeout(() => { onClose(); navigate('/'); }, 1500)` so `useAllProductAccess` re-queries on Bibliotek mount and unlocked products appear. (Closing the sheet first avoids the sheet hanging open over the new route.)
  - `finally` resets `restoringPurchases`.
- UI, gated by `Capacitor.isNativePlatform()`:
  - A "Mina köp" subtle label row (matches the "Inloggad som …" label styling at lines 60-69).
  - A button styled to match the existing Logga ut / Radera konto buttons exactly (font-sans, 15px, padding 16px 24px, full-width left-aligned, background none, no border) but in primary text color `#2C2420` (not destructive red — restore is a neutral action). When `restoringPurchases`, swap label for `<Loader2 className="animate-spin" size={14} /> Återställer…` rendered inline.
  - A small helper line beneath: `Har du köpt Bonki på en annan enhet? Återställ dina köp här.` styled like the email row (13px, `#6B5E52`).
  - A divider after this section (matches the existing 1px `hsla(30, 15%, 20%, 0.10)` dividers used between every row in the sheet).
- All styling uses the inline-style conventions already in `KontoSheet.tsx` (no Tailwind classes added).

### Not touching

- `BuyPage.tsx`, `revenuecat-webhook`, `stripe-webhook`, `AuthContext.tsx`
- Paywall components (`ProductPaywall`, `PaywallFullScreen`, `PaywallBottomSheet`, `Paywall`)
- `useProductAccess.ts`, `useAllProductAccess.ts`
- Protected: `CardView.tsx`, `useSessionReflections.ts`, `useNormalizedSessionState.ts`
- `--surface-base` CSS variable
- `Header.tsx` (the sheet host) — no changes needed; `KontoSheet` is self-contained

### Verification

- **Web**: `Capacitor.isNativePlatform() === false` → "Mina köp" section is not rendered. Sheet behaves identically to today (Konto label, email, Integritetspolicy, Logga ut, Radera konto).
- **Native iOS**: Section appears above Logga ut. Tap → spinner + "Återställer…". With no purchases → `Inga tidigare köp hittades.` With purchases → `Dina köp har återställts.` then sheet closes and navigates to `/`. Webhook (Prompt 3) writes the rows; on Bibliotek mount, `useAllProductAccess` re-queries and previously-purchased products are unlocked.
- **No layout regression** in the sheet — the new rows follow the same row+divider rhythm already in the file.

### Deferred (per prompt)

- Android restore (Google Play Billing not yet wired).
- Auto-restore on app launch.
- Per-product restore feedback (we surface count, not names).

