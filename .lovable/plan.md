

## Create /buy Route — Purchase Flow from External Website

### What This Does
Adds a new `/buy` page that handles purchases from bonkistudio.com. Users land on `/buy?product=jag_i_mig`, log in via email OTP if needed, and are automatically redirected to Stripe checkout.

### Files Changed

**1. New file: `src/pages/BuyPage.tsx`**
- Shows product context (name, price, card count) at top
- If not logged in: email input → OTP verification → auto-triggers Stripe checkout on success
- If already logged in: auto-triggers Stripe checkout on mount
- Invalid/missing product param → "Produkten hittades inte" with link to /login
- Fetches price from `products` table (with sensible fallbacks)
- Reuses existing patterns: `usePageBackground`, `InputOTP`, `TermsConsent`, `useAuth`, palette constants
- Uses `checkoutTriggered` ref to prevent double Stripe calls
- Calls `create-checkout` edge function (unchanged) with proper success/cancel URLs

**2. Modified: `src/App.tsx`**
- Add import for `BuyPage`
- Add route `<Route path="/buy" element={<BuyPage />} />` after `/privacy` and before the `/*` catch-all (line 182)
- This route is public (outside `ProtectedRoutes`), so unauthenticated users can access it

### Technical Notes
- The `cooldownRef` type will be `useRef<ReturnType<typeof setInterval> | null>(null)` (matching Login.tsx pattern)
- After OTP verification, `AuthContext` updates `user` state, which triggers a `useEffect` that calls `triggerCheckout`
- The prompt's JSX had some rendering issues (stripped tags) — will reconstruct clean JSX matching the described behavior and Login.tsx styling patterns
- Button text on verify: "Verifiera och köp" (distinct from Login page's "Verifiera")
- No changes to Login.tsx, AuthContext, create-checkout, or ProtectedRoutes

### Not Changed
- `src/pages/Login.tsx`
- `src/contexts/AuthContext.tsx`
- `supabase/functions/create-checkout/index.ts`
- Any existing routes or protected route logic

