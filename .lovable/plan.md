# Google Play rejection — final plan v4 (Option B + policy compliance)

## Schema verification (already done)

- `user_product_access`: `granted_via`, `granted_at`. Unique on `(user_id, product_id)`. FK to `products(id)`.
- All 7 product IDs active in Live.
- IAP audit confirmed: every "Köp" gate uses `Capacitor.isNativePlatform()` not `isIOSNative()`, and every Stripe-web fallback uses `window.location.href` (in-WebView, untested on Android Capacitor). Reviewer with full grants never sees the Buy button. → Option B (hide CTA on Android) chosen.

## Execution order (two prompts, sequenced)

**Prompt 1** = Section 1 (`isAndroidNative` helper) + Section 3 (Login.tsx two-line edits). Small surface, verify in preview before sending Prompt 2.

**Prompt 2** = Section 2 (8-file CTA wrap). Larger blast radius, written as literal FROM/TO per file with explicit DO-NOT list.

Sections 4 (user provisioning) and 5 (App Access text) are manual steps you do in Lovable Cloud / Play Console — no Lovable prompt needed.

---

### 1. Add the Android-native gate

**`src/lib/platform.ts`** — append:

```ts
/**
 * True on Android native builds (Capacitor). Used to hide native IAP entry points
 * until Google Play Billing is wired in a future release.
 */
export const isAndroidNative = (): boolean =>
  Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
```

### 2. Hide Buy CTA on Android, show neutral message

In all 8 purchase sites, wrap the existing CTA so when `isAndroidNative()` is true, the button is replaced by:

```tsx
{isAndroidNative() ? (
  <div
    style={{
      padding: '16px 20px',
      borderRadius: 'var(--radius-md)',
      background: 'rgba(255,255,255,0.06)',
      color: 'var(--color-text-secondary)',
      fontSize: 14,
      lineHeight: 1.5,
      textAlign: 'center',
    }}
  >
    Köp är inte tillgängliga i Android-versionen just nu.
    Vi arbetar på det. Logga in med samma konto för att låsa
    upp produkter du redan äger.
  </div>
) : (
  /* existing Buy button + handlePurchase wiring — unchanged */
)}
```

**Lovable prompt instruction (verbatim, belt-and-suspenders):** *Do NOT turn any text into an `<a>` tag or any other link, anywhere. Do NOT add an "Open in browser" button. Do NOT mention `bonkiapp.com` — that is intentional, to avoid out-of-app purchase steering for digital goods under Google Play's payments policy. The replacement message must be plain text inside a `<div>`. Do NOT modify `handlePurchase` — only wrap the rendered CTA. Do NOT change anything outside the listed files.*

Files (8):
- `src/components/PurchaseScreen.tsx`
- `src/components/PaywallBottomSheet.tsx`
- `src/components/ProductPaywall.tsx`
- `src/pages/Paywall.tsx`
- `src/pages/PaywallFullScreen.tsx`
- `src/pages/BuyPage.tsx` (both authenticated and direct-checkout buttons)
- `src/pages/CardView.tsx` (completion-screen buy)

### 3. Neutralize the reviewer block UI (`src/pages/Login.tsx`)

- **Line 308**: `App Store Review` → `Store Review`
- **Line 318** (placeholder): `apple.review@bonkistudio.com` → `reviewer@bonkistudio.com`

Lines 239–240 (autofill button — Apple credentials) untouched. App Access text never mentions the autofill button so the Play reviewer pastes manually.

### 4. Provision the Play reviewer in Live (manual)

**4a. Existence check** — Lovable Cloud SQL (Live):

```sql
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email = 'play.review@bonkistudio.com';
```

Expect **0 rows**. If 1 row: capture the existing UUID, skip 4b, jump to 4c.

**4b. Create user** in Lovable Cloud → Users → Live:
- Email: `play.review@bonkistudio.com`
- Password: `BonkiPlay2026` *(no `!`)*
- Email confirmed: yes

Copy the new UUID.

**4c. Grant all 7 products** — replace `<NEW_UUID>`, run in Live SQL:

```sql
INSERT INTO user_product_access (user_id, product_id, granted_via, granted_at)
VALUES
  ('<NEW_UUID>', 'still_us',         'manual_grant', now()),
  ('<NEW_UUID>', 'jag_i_mig',        'manual_grant', now()),
  ('<NEW_UUID>', 'jag_med_andra',    'manual_grant', now()),
  ('<NEW_UUID>', 'jag_i_varlden',    'manual_grant', now()),
  ('<NEW_UUID>', 'vardagskort',      'manual_grant', now()),
  ('<NEW_UUID>', 'syskonkort',       'manual_grant', now()),
  ('<NEW_UUID>', 'sexualitetskort',  'manual_grant', now())
ON CONFLICT (user_id, product_id) DO NOTHING;
```

**4d. Verify** — expect 7 rows:

```sql
SELECT product_id FROM user_product_access
WHERE user_id = '<NEW_UUID>' ORDER BY product_id;
```

### 5. App Access declaration text for Play Console (English-first)

```
Username: play.review@bonkistudio.com
Password: BonkiPlay2026

Notes (English):

1. The app's user interface is in Swedish. The instructions
   below are in English; Swedish UI strings are quoted so you
   can recognize them visually.

2. On the login screen, the top section is labeled
   "Recensentinloggning — Store Review". This section contains
   an email field and a password field. Paste the username and
   password above into these two fields and tap the button
   labeled "Logga in" (Swedish for "Log in").

3. Do NOT tap "Fortsätt med Google" or "Fortsätt med e-post"
   on the login screen. These are public sign-in flows that
   send a one-time verification code to a real email inbox
   and will not work for review. Use only the
   "Recensentinloggning — Store Review" section at the top.

4. After signing in you will land on the library screen with
   all 7 products fully unlocked — no paywall, no onboarding,
   no payment required.

5. All app features are reachable from the bottom navigation
   bar with three tabs: "BIBLIOTEKET" (Library, the product
   list), "HEM" (Home), and "ERA SAMTAL" (Your Conversations,
   the journal of saved reflections).

6. To explore a product: tap any tile on the Library screen,
   then tap a card to start a guided conversation. Each
   product is a set of conversation prompts in Swedish; you
   can navigate between cards using the arrows without
   needing to read the prompt content.

7. In-app purchases are not available in the Android version
   in this release; Google Play Billing integration is
   scheduled for the next update. The reviewer account
   above has all products pre-granted, so no purchase flow
   is required to review the app's features.

The app does not use 2FA, geo-gating, location-based
restrictions, or expiring passwords. The credentials above
are reusable and do not expire.
```

## Explicitly NOT doing

- ❌ No Stripe-in-Android-WebView path. No `Capacitor.Browser.open()` swap.
- ❌ No mention of `bonkiapp.com` inside the app on Android. No clickable links anywhere in the replacement message.
- ❌ No Play Billing integration (target 1.0.1).
- ❌ No migration into `auth.users`. Users UI is the documented path.
- ❌ No re-provisioning of `f05b6b17-...` (Apple reviewer untouched).
- ❌ No change to autofill button credentials or `isProductHiddenOnPlatform`.
- ❌ No iOS resubmission. **Calendar note:** next iOS archive will display "Store Review" header and `reviewer@bonkistudio.com` placeholder — strict improvements.

## Files touched

- `src/lib/platform.ts` — add `isAndroidNative()`.
- `src/pages/Login.tsx` — two single-line edits (308, 318).
- 8 paywall/buy files — wrap CTA in `isAndroidNative()` ternary with the neutral message.

## Post-ship checklist (Mac, in order)

```bash
# 1. Pull
git pull

# 2. Confirm the build will point at LIVE (loud failure if not)
grep -E "^VITE_SUPABASE_URL=.*spgknasuinxmvyrlpztx" .env.local \
  && echo "OK: Live" \
  || (echo "STOP: .env.local is missing or not Live"; exit 1)

# 3. Build
npm run build

# 4. Verify the bundle baked the LIVE URL, not Test
grep -o "spgknasuinxmvyrlpztx" dist/assets/*.js | head -1   # MUST print
grep -o "wcienwozdurwhswaarjy" dist/assets/*.js | head -1   # MUST be empty

# 5. Sync
npx cap sync android
npx cap sync ios
```

In Android Studio:
- `android/app/build.gradle`: `versionCode: 2 → 3`, `versionName` unchanged
- Build → Generate Signed Bundle → `bonki-keystore-v2.jks` → release
- Upload AAB, paste App Access text from Section 5, resubmit

## Smoke test in Android emulator (5 min, before AAB upload)

Run `adb logcat *:E Capacitor:V` in a terminal during step 1 to catch any plugin-init errors (especially `@capgo/capacitor-social-login`).

1. **Reviewer login**: `play.review@bonkistudio.com` / `BonkiPlay2026` → expect immediate access, no paywall.
2. **Paywall surfaces hidden**: log out, create a throwaway test account in Lovable Cloud Users (no grants) — e.g. `smoke.test.android@bonkistudio.com`. Open any locked product. Expect the neutral "Köp är inte tillgängliga..." message, **not** a Buy button, **not** an error toast, **not** a `bonkiapp.com` link. Delete the throwaway after.
3. **KontoSheet**: Konto → confirm "Radera konto" reachable above BottomNav (Build 7 fix; first Android-emulator validation).
4. **Logout / re-login**: KontoSheet → Logga ut → confirm reviewer block reappears → log back in with Play credentials.

If a Buy button appears anywhere on Android, the `isAndroidNative()` wrap missed a file. If `bonkiapp.com` appears anywhere as a link, Lovable refactored the plain text — revert and re-prompt.

## Out of scope but logged

- **Play Billing integration** — target 1.0.1.
- **Stripe-in-Android-WebView validation** — only if we ever re-enable Stripe-web on Android. Would need `Capacitor.Browser.open()` (Chrome Custom Tabs).
- **In-app account deletion (May 2024 Play requirement)** — Build 7 KontoSheet covers this, validated in smoke test step 3.
- **~30 unreviewed commits ship in version code 3**. Most are Play-positive. Real Android runtime risk surface narrows to `@capgo/capacitor-social-login` plugin init — caught by the logcat watch in smoke test.
