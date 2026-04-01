

## Disable Beta-Test Features for Launch

### Summary
Remove or disable all beta/test infrastructure so none of it ships in the production app. Six files need changes; one terms section needs updating.

### Changes

**1. Remove test mode system (3 files)**

- **`src/App.tsx`**: Remove `detectTestModeParam()` call (line 178), remove `<TestModeBanner />` (line 189), remove `<TestModePanel />` (line 192), remove the two imports.

- **`src/pages/Paywall.tsx`**: Remove the `isTestMode()` import, remove the test-mode bypass button block (lines 242–276), remove `isTestMode()` from the `bypassed` variable (line 20 — keep only `isDemoMode()`).

- **`src/components/still-us/Share.tsx`**: Remove the `isTestMode()` import and the "simulate partner check-in" button block (lines 230–234+).

**2. Disable FeedbackSheet (2 files)**

The post-session "Hur var det?" rating sheet writes to `beta_feedback` / `still_us_feedback`. This should not show to real users.

- **`src/components/CompletedSessionView.tsx`**: Remove or comment out the `<FeedbackSheet>` render (line 426).
- **`src/pages/CardView.tsx`**: Remove or comment out the `<FeedbackSheet>` render and its related state.

**3. Update terms text (1 file)**

- **`src/components/TermsConsent.tsx`**: Remove Section 7 "Betatestning" (lines 114–117) or replace with production-appropriate text.

### Files NOT deleted (safe to leave dormant)
- `src/lib/testMode.ts`, `src/components/TestModeBanner.tsx`, `src/components/TestModePanel.tsx`, `src/components/FeedbackSheet.tsx` — these files become dead code with no entry points. They can be cleaned up later without risk.

### What stays untouched
- All session logic, theme hooks, animations, protected patterns
- Analytics dashboard (admin-only, separate concern)
- Demo mode (`demoMode.ts`) — separate from test mode

