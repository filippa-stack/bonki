
Single-line change in `capacitor.config.ts`.

## Update Capacitor App ID

**File:** `capacitor.config.ts`

Change `appId` from `com.bonkistudio.bonki` to `com.bonkistudio.bonkiapp`. No other fields touched.

### Note for user
After this change, you'll need to:
1. Pull the project from GitHub
2. Run `npx cap sync` to propagate the new app ID to the native Android project
3. Submit the new build to Google Play under the new package name
