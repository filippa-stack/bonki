# iOS Native Templates

Files here are **not** automatically part of the iOS build. The `ios/` directory is generated locally via `npx cap add ios` and is gitignored. After running `npx cap sync ios`, copy these files into the generated Xcode project as instructed below.

---

## PrivacyInfo.xcprivacy

Apple's Privacy Manifest. **Required for App Store submission** since May 1, 2024.

### One-time placement

On your Mac, from the project root:

```bash
cp ios-templates/PrivacyInfo.xcprivacy ios/App/App/PrivacyInfo.xcprivacy
open ios/App/App.xcworkspace
```

### Add to the Xcode target (one-time)

1. In Xcode's left navigator, right-click the inner `App` group (the one next to `AppDelegate.swift` and `Info.plist`) → **Add Files to "App"…**
2. Select `PrivacyInfo.xcprivacy` from `ios/App/App/`.
3. In the dialog:
   - **Destination**: leave "Copy items if needed" UNCHECKED (the file is already in place).
   - **Added folders**: "Create groups".
   - **Add to targets**: tick **App** only.
4. Click **Add**.
5. Select the file in the navigator and confirm in the right-hand File Inspector that **Target Membership → App** is ticked.
6. Build → Archive → Validate. Apple reads the manifest from the archive.

> Subsequent `npx cap sync ios` runs do **not** wipe `PrivacyInfo.xcprivacy` — it persists with the rest of `ios/App/App/`.

### When to update it

Update the manifest if any of the following change:
- New SDK added that uses a Required Reason API (RevenueCat, new Capacitor plugins, etc.)
- New data category collected (push tokens, location, contacts, etc.)
- Tracking behavior changes (currently `NSPrivacyTracking = false`)

### What's declared

| Category | Linked to user | Used for tracking | Purpose |
|---|---|---|---|
| Email address | Yes | No | Auth, app functionality |
| User ID | Yes | No | Auth, app functionality |
| Other user content (reflections) | Yes | No | App functionality |
| Product interaction | Yes | No | Analytics, app functionality |
| Crash data | No | No | App functionality |
| Performance data | No | No | Analytics |

Required Reason APIs declared:
- `NSPrivacyAccessedAPICategoryUserDefaults` — reason `CA92.1`
- `NSPrivacyAccessedAPICategoryFileTimestamp` — reason `C617.1`
- `NSPrivacyAccessedAPICategorySystemBootTime` — reason `35F9.1`
- `NSPrivacyAccessedAPICategoryDiskSpace` — reason `E174.1`

These cover Capacitor core, WKWebView, the Capacitor Preferences/Filesystem plugins, and RevenueCat.
