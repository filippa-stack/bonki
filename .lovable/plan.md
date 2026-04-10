

## Add Public Privacy Policy Page

### What we're building
A standalone `/privacy` page displaying Bonki's full Swedish privacy policy, publicly accessible without login.

### Changes

**1. Create `src/pages/PrivacyPolicy.tsx`**
- Background: `#0B1026`, text: `#C8BDB0`, headings: `#D4943A`
- Max-width 720px, centered, 40px padding
- "← Tillbaka" link at top navigating to `/`
- All 9 sections of Swedish privacy policy text exactly as specified
- No BottomNav (page is outside ProtectedContent)

**2. Add route in `src/App.tsx`**
- Add `<Route path="/privacy" element={<PrivacyPolicy />} />` in the `AppRoutes` component alongside `/login`, `/install`, `/screenshot-export`, `/analytics` — outside `ProtectedRoutes`
- Import `PrivacyPolicy` from `@/pages/PrivacyPolicy`

### What stays untouched
- No changes to any existing component, hook, context, or route
- `TermsConsent.tsx` unchanged
- `BottomNav` only renders inside `ProtectedContent`, so it won't appear on `/privacy`

### Verification
- `/privacy` loads without authentication
- Full text visible, styled correctly
- Back link works
- No regressions on existing routes

