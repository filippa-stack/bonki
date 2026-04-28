# Remove reviewer autofill button from Login.tsx

## Why
The "Fyll i granskningsuppgifter" button hardcodes Apple reviewer credentials, which breaks for Google Play reviewers (different credentials). Removing the convenience button forces both sets of reviewers to paste credentials from store-supplied notes — eliminates the cross-store footgun.

## Changes (single file: `src/pages/Login.tsx`)

### 1. Remove the autofill button in Block A (lines 365–377)
Delete the entire `<button onClick={handleAutofillReviewer}>…Fyll i granskningsuppgifter…</button>` element inside the native reviewer block. The preceding "Logga in" submit button (line 363) and the closing `</div>` (line 378) stay.

### 2. Remove the now-dead `handleAutofillReviewer` helper (lines 238–241)
```ts
const handleAutofillReviewer = () => {
  setReviewerEmail('apple.review@bonkistudio.com');
  setReviewerPassword('BonkiReview2026');
};
```
This is its only call site. Removing it also clears the hardcoded `apple.review@bonkistudio.com` / `BonkiReview2026` strings from the file (verification grep requires 0 matches).

### 3. Block B (line 648 area)
Inspected — Block B has email input, password input, and a single "Logga in" submit button only. No autofill button exists there. No change needed.

## Untouched
- `isNative` gate (Block A) and `isReviewerMode && !isNative` gate (Block B)
- "RECENSENTINLOGGNING" header, email/password inputs, "Logga in" submit button
- `handleReviewerSignIn`, OTP routing, password sign-in handlers
- Apple Sign In, "Fortsätt med e-post"
- Sync guards (`suppressUntilRef`, `prevServerStepRef`, `pendingSave`, `hasSyncedRef`)

## Verification (post-apply)
- `grep -c "Fyll i granskningsuppgifter" src/pages/Login.tsx` → 0
- `grep -c "apple.review" src/pages/Login.tsx` → 0
- `grep -c "BonkiReview2026\|BonkiPlay2026" src/pages/Login.tsx` → 0
- Preview `/login?review=1`: reviewer block still renders with email/password + "Logga in", no autofill button (belt-and-suspenders re-check on Block B in web preview)
- Preview `/login` (no query param): regression — normal Apple/email login only, no reviewer block
