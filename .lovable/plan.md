## Pre-flight status for 1.0 (7) + ship the one missing piece

### Verified shipped to main (no action needed)

| Item | Evidence |
|---|---|
| Disclaimers + sexualitetskort hide + age labels | Verified in last loop |
| **RevenueCat native routing (5 changes)** | `purchaseProduct` + `Capacitor.isNativePlatform()` guards live in `ProductPaywall.tsx` (line 110), `PurchaseScreen.tsx` (line 70), `BuyPage.tsx` (lines 113, 188, 366); `ProductIntro.tsx:505` shows "Köp via App Store" on native; `BuyPage.tsx` has native error UX |
| **delete-account edge function + Apple revoke** | `supabase/functions/delete-account/index.ts` is 244 lines, mints ES256 `client_secret` JWT against `appleid.apple.com`, calls `/auth/revoke`, audit-logs all paths (`apple_revoke_skipped_no_identity`, `apple_revoke_skipped_not_apple_user`, `apple_revoke_skipped_no_token`) |
| **KontoSheet "Radera konto" wiring** | `KontoSheet.tsx:85` invokes `supabase.functions.invoke('delete-account')`; button rendered at lines 279/299 |
| **Privacy Policy 172-line replacement** | `src/pages/PrivacyPolicy.tsx` is exactly 172 lines |

### Not shipped — ship now

**PrivacyInfo.xcprivacy** is missing. Reason: this project follows the standard Capacitor pattern where `ios/` is generated locally on your Mac via `npx cap add ios` and is gitignored, so I can't drop the file directly at `ios/App/App/PrivacyInfo.xcprivacy` from here.

Solution: ship the manifest as a **template artifact** in the repo with paste-in instructions. You copy it once on your Mac into the generated Xcode project.

### Files to add

1. **`ios-templates/PrivacyInfo.xcprivacy`** — full Apple Privacy Manifest, declaring:
   - `NSPrivacyTracking = false`, no tracking domains
   - Collected data types: email, user ID, other user content (reflections), product interaction, crash data, performance data — all marked `NSPrivacyCollectedDataTypeTracking = false`, purposes limited to `AppFunctionality` / `Authentication` / `Analytics`
   - Required Reason APIs: UserDefaults (CA92.1), FileTimestamp (C617.1), SystemBootTime (35F9.1), DiskSpace (E174.1) — covers Capacitor + WKWebView + RevenueCat

2. **`ios-templates/README.md`** — one-time placement and Xcode target-membership instructions (`ios/App/App/PrivacyInfo.xcprivacy` → right-click `App` group → Add Files → tick **App** target → Build/Archive/Validate).

### Out of scope

- No code changes. No edge function changes. No DB changes.
- No automated `npx cap sync` step — that runs on your Mac.

### Your one-time iOS step on your Mac

```
cp ios-templates/PrivacyInfo.xcprivacy ios/App/App/PrivacyInfo.xcprivacy
open ios/App/App.xcworkspace
# Right-click App group → Add Files to "App"… → select PrivacyInfo.xcprivacy → tick App target only
```

Then archive 1.0 (7) and validate. Apple reads the manifest from the archive.
