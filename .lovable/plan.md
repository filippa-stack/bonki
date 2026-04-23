

## Make the reviewer login impossible to miss on native iOS

The reviewer's screenshots prove the root cause: on the iPhone 17 Pro Max, the three OAuth buttons + consent text fill the visible area. The "Recensentinloggning" section is rendered (the code is correct), but it sits **below the fold** under the consent text. The reviewer never scrolled, tapped "Fortsätt med e-post" instead, and got stuck on an OTP screen for a fake email they can't read.

### Fix

Move the reviewer form **above** the OAuth buttons on native iOS, and make it the visually dominant element so it's the first thing the reviewer sees.

**`src/pages/Login.tsx`** — restructure the main CTA stack on native:

1. **On native iOS only**, render the reviewer email/password form **at the top of the stack**, above "Fortsätt med Apple". Keep it under a clear header: `RECENSENTINLOGGNING — App Store Review`.
2. Style it as the primary section (not a low-emphasis afterthought): full-width inputs, orange "Logga in" button matching the rest of the UI, with pre-filled placeholder text showing the credentials format (`apple.review@bonkistudio.com`).
3. Add a thin divider below it, then the existing OAuth buttons stay underneath as secondary options.
4. On web, the reviewer form remains gated behind `?review=1` and stays in its current position below the OAuth buttons (no change to public web UX).
5. Remove the duplicate reviewer block at the bottom of the file (lines 517–589) since it's being moved up.

### Why this works

- Reviewer opens app → first thing visible is "RECENSENTINLOGGNING" with email/password fields → uses the credentials from App Store Connect → lands authenticated with full product access (already granted via the migration).
- They cannot accidentally use Apple Sign In (which is broken until the Xcode entitlement is added) or the email OTP flow (which sends to an unreadable inbox).
- Public web users see no change.

### Files changed

- `src/pages/Login.tsx` — reorder CTA stack on `isNative`, move reviewer form to top, remove old bottom block.

### Untouched

- `src/lib/appleSignIn.ts` (Apple Sign In still needs the Xcode entitlement — separate manual step).
- `AuthContext`, routing, Supabase config.
- Web login UX.
- Reviewer account access grants (already in place).

### Still required outside Lovable before resubmitting

1. **Xcode** → Signing & Capabilities → `+ Capability` → **Sign in with Apple** on the BONKI target.
2. **Apple Developer Console** → App ID `com.bonkistudio.bonkiapp` → enable **Sign In with Apple** → regenerate provisioning profile.
3. `npx cap sync ios` → Archive → upload new build.
4. In App Store Connect reply: tell the reviewer "Use the **Recensentinloggning** form at the top of the login screen with the credentials provided. Apple Sign In is also fixed in this build."

### Verification

- On native preview: open app → reviewer form is the first thing visible above the Apple/Google buttons.
- Enter `apple.review@bonkistudio.com` / `BonkiReview2026!` → lands in the library with all 7 products unlocked.

### Rollback

Revert `Login.tsx` to current state.

