## Plan: Android RevenueCat Initialization

Edit `src/lib/revenueCat.ts` with two minimal changes:

**1. Add Google API key constant** (after `APPLE_API_KEY`):
```ts
const GOOGLE_API_KEY = 'goog_QZpYqnRJZyrEpVRbrfRtxGhNWqW';
```

**2. Replace the iOS-only platform block** inside `initRevenueCat`'s try block:
```ts
if (Capacitor.getPlatform() === 'ios') {
  await Purchases.configure({ apiKey: APPLE_API_KEY, appUserID: userId });
  initialized = true;
} else if (Capacitor.getPlatform() === 'android') {
  await Purchases.configure({ apiKey: GOOGLE_API_KEY, appUserID: userId });
  initialized = true;
}
```
The `// Android support added in a later prompt` comment is removed.

No other changes. All other functions (`purchaseProduct`, `restorePurchases`, `logOutRevenueCat`, `presentCodeRedemptionSheet`), the web early-return, the already-initialized logIn branch, log level, and try/catch structure remain untouched.