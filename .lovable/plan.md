# Plan v6 — Prompt 1: three code changes (audited, scoped)

Three surgical edits. No refactors. Nothing outside these files touched.

## Change 1 — `src/lib/platform.ts`

Replace lines 13–16:

```ts
export const HIDDEN_PRODUCT_IDS_NATIVE = ['sexualitetskort'] as const;

export const isProductHiddenOnPlatform = (productId: string): boolean =>
  Capacitor.isNativePlatform() &&
  (HIDDEN_PRODUCT_IDS_NATIVE as readonly string[]).includes(productId);
```

`isIOSNative` and `isAndroidNative` exports stay unchanged (still used by other files).

## Change 2 — `src/lib/productRecommendations.ts`

- Line 19: swap `import { isIOSNative } from '@/lib/platform';` → `import { Capacitor } from '@capacitor/core';`
- Line 41: rename `HIDDEN_SLUGS_IOS` → `HIDDEN_SLUGS_NATIVE`
- Lines 58–66: replace `iosHidden = isIOSNative()` → `nativeHidden = Capacitor.isNativePlatform()`, and the two `HIDDEN_SLUGS_IOS` references → `HIDDEN_SLUGS_NATIVE`
- Comment on line 58 updated to "On native (iOS + Android)"

Existing `null`-return contract preserved → `NextActionBanner` already handles `null` gracefully.

## Change 3 — New `/delete-account` route

**`src/App.tsx`:**
- Add import next to `PrivacyPolicy`: `import DeleteAccount from "./pages/DeleteAccount";`
- Add route below `/privacy`: `<Route path="/delete-account" element={<DeleteAccount />} />`

**`src/pages/DeleteAccount.tsx` (new file):** mirrors `PrivacyPolicy.tsx` styling exactly — same `#0B1026` bg, `#D4943A` accent, `Section` helper, max-width 720, padding 40, "← Tillbaka" link to `/`. Swedish content:

- H1 "Radera konto"
- §1 **Radera direkt i appen (rekommenderat)** — Konto → Radera konto, instant, oåterkallelig
- §2 **Utan app-tillgång** — email **`hello@bonkistudio.com`** from the account's email address, "Radera konto" subject, deletion within 30 days
- §3 **Vad raderas** — profil, samtal, reflektioner, takeaways, bookmarks, notiser, betalningsåtkomst
- §4 **Vad sparas av juridiska skäl** — kvittoreferenser, 7 år, samma formulering som /privacy §6
- §5 **Mer information** — link back to `/privacy`

## Hard constraints (do NOT touch)

- Reviewer block on `Login.tsx` and autofill credentials
- `isAndroidNative()` paywall hide ternaries (8 files from v4)
- `suppressUntilRef`, `prevServerStepRef`, `clearTimeout(pendingSave.current)`, `hasSyncedRef` patterns anywhere
- `KIDS_PRODUCT_IDS` set in `PaywallBottomSheet.tsx` — category check, must keep `sexualitetskort`
- Anything in `src/lib/platform.ts` outside lines 13–16
- Anything in `src/lib/productRecommendations.ts` outside the four spots listed
- Anything in `src/App.tsx` outside the two listed insertions

## Verification after apply

- `rg -n "HIDDEN_PRODUCT_IDS|HIDDEN_SLUGS" src/` (or `grep -rn "HIDDEN_PRODUCT_IDS\|HIDDEN_SLUGS" src/` on a machine without ripgrep) → only `_NATIVE` variants remain
- `rg -n "isIOSNative" src/lib/productRecommendations.ts` → no matches
- `/delete-account` route renders in preview without console errors
