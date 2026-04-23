

## Reviewer email/password login (hidden behind `?review=1`)

Single-file edit to `src/pages/Login.tsx`. Adds a subdued reviewer-only sign-in section that appears only when the URL contains `?review=1`. All existing OAuth + OTP flows stay untouched.

### Edit — `src/pages/Login.tsx`

1. **Imports**
   - Add `useSearchParams` to the existing `react-router-dom` import (already imports `useNavigate`).
   - `supabase`, `toast`, `Loader2` are already imported — reuse them.

2. **State + query-param read** (top of `Login` component, alongside existing `useState` calls)
   - `const [searchParams] = useSearchParams();`
   - `const isReviewerMode = searchParams.get('review') === '1';`
   - `const [reviewerEmail, setReviewerEmail] = useState('');`
   - `const [reviewerPassword, setReviewerPassword] = useState('');`
   - `const [reviewerLoading, setReviewerLoading] = useState(false);`

3. **Handler**
   ```ts
   const handleReviewerSignIn = async () => {
     if (!reviewerEmail.trim() || !reviewerPassword) return;
     setReviewerLoading(true);
     try {
       const { error } = await supabase.auth.signInWithPassword({
         email: reviewerEmail.trim(),
         password: reviewerPassword,
       });
       if (error) toast.error('Felaktig inloggning.');
       // Success: AuthContext's onAuthStateChange handles navigation.
     } catch {
       toast.error('Felaktig inloggning.');
     } finally {
       setReviewerLoading(false);
     }
   };
   ```

4. **JSX — render only when `isReviewerMode && !otpSent && !showEmailForm`**

   Placed after the `<TermsConsent>` block (still inside the `max-w-[320px]` column, with `marginTop: 32`). Subdued styling that matches the existing OTP form inputs and button — same `h-14`, same `rounded-xl`, same `SOFT_BORDER`, same `ORANGE_GRADIENT` button — but introduced by a small muted heading so it reads as a secondary/technical section.

   - Divider: 1px line at `rgba(253, 246, 227, 0.10)` above the section.
   - Heading: `Recensentinloggning` — `font-size: 12px`, `letter-spacing: 0.08em`, `text-transform: uppercase`, color `rgba(253, 246, 227, 0.45)`.
   - Email `<input type="email" autoComplete="email">` reusing the OTP form's input style + `handleFocus`/`handleBlur`.
   - Password `<input type="password" autoComplete="current-password">` same styling.
   - Button: `Logga in` — same `ORANGE_GRADIENT` + `ORANGE_SHADOW` as `Verifiera`, disabled while `reviewerLoading` or fields empty, shows `<Loader2 className="animate-spin" />` while loading. Submits via `handleReviewerSignIn`. Enter key in either field triggers submit.

### Visibility rules

| Condition | Reviewer section visible? |
|---|---|
| No `?review=1` | No |
| `?review=1`, main view | **Yes** (under OAuth + OTP buttons) |
| `?review=1`, OTP code-entry view | No (hidden so it doesn't crowd code entry) |
| `?review=1`, email-entry sub-view | No |

### Untouched

- All existing OAuth handlers (Apple native, Apple OAuth, Google) and JSX
- OTP `signInWithOtp` + `verifyOtp` flow, resend cooldown
- `saveConsent`, `TermsConsent`, demo-mode button
- `AuthContext` (existing `onAuthStateChange` handles post-login navigation)
- `MIDNIGHT_INK`, `LANTERN_GLOW`, `ORANGE_GRADIENT`, `SOFT_BORDER`, `FOCUS_RING` constants
- No Supabase config changes — email/password is already enabled
- No new dependencies, no new files, no route changes

### Verification

1. `/login` (no param) → identical to current production: Apple/Google + e-post OTP + consent links. No reviewer section.
2. `/login?review=1` → all existing buttons render unchanged; below the consent links, a small `RECENSENTINLOGGNING` section appears with email + password fields and a Bonki Orange `Logga in` button.
3. Submit valid Supabase email/password → existing `onAuthStateChange` redirects into the app.
4. Submit invalid credentials → Sonner toast `Felaktig inloggning.`; page state preserved; button re-enables.
5. Tap `Fortsätt med e-post` while in reviewer mode → reviewer section hides during the email/OTP sub-flow, returns when user taps `Tillbaka`.
6. TypeScript compiles cleanly; no console errors.

