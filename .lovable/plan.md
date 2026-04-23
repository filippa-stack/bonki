
## Fix the actual reviewer-login blocker: the stored password is wrong (or being entered differently), not the placement of the form

The current evidence points to a credential mismatch, not a missing UI:

- the reviewer user exists
- the account is confirmed
- the account has a password set
- there has still never been a successful sign-in

That means the blocker is almost certainly that the backend password for `apple.review@bonkistudio.com` is not the same password you expect reviewers to use, or iPhone input is subtly altering what gets submitted.

### What to change

#### 1. Reset the reviewer account password in both environments
Update the existing reviewer user in both Preview/Test and Published/Live to a fresh, known password.

Use a simpler App Review password with no punctuation and no ambiguous characters, for example:
- `BonkiReview2026`

This removes the risk of:
- a mistaken original password
- issues around `!` or other symbols on iPhone keyboards
- copy/paste or keyboard-substitution edge cases

#### 2. Keep the reviewer login at the top on native
Do not undo the earlier UI change. The reviewer form should stay first on native iOS so Apple sees it immediately.

#### 3. Harden the reviewer inputs on iPhone
Update `src/pages/Login.tsx` reviewer fields so the app submits exactly what the reviewer types:

- email:
  - trim whitespace
  - lowercase before submit
  - `autoCapitalize="none"`
  - `autoCorrect="off"`
  - `spellCheck={false}`
  - `inputMode="email"`
- password:
  - keep exact value except normalize accidental pasted non-breaking spaces if present
  - `autoCapitalize="none"`
  - `autoCorrect="off"`
  - `spellCheck={false}`

#### 4. Surface the real auth error for reviewer login
Right now the app always shows `Felaktig inloggning.`

Change reviewer-mode error handling in `src/pages/Login.tsx` to:
- log the real auth error to console
- show the exact backend error text in reviewer mode only, or a clearer mapped message like:
  - `Fel e-post eller lösenord`
  - `Kontot är inte bekräftat`
  - `Inloggning med lösenord är inte tillgänglig`

This makes future failures diagnosable instead of opaque.

#### 5. Optional but recommended: add a native-only autofill shortcut for review
Add a small secondary button under the reviewer header on native only:

- `Fyll i granskningsuppgifter`

It should populate the reviewer email automatically and optionally the password too. This reduces typing mistakes during review without changing the main auth flow.

### Files / systems involved

#### Code
- `src/pages/Login.tsx`
  - keep reviewer form at top on native
  - harden reviewer input attributes
  - normalize submitted values
  - improve reviewer error handling
  - optional autofill shortcut

#### Backend auth
- existing reviewer user:
  - `apple.review@bonkistudio.com`
- reset password in:
  - Preview/Test backend
  - Published/Live backend

### What this does not change
- product access grants for the reviewer account
- Google login
- regular user login flow
- the Apple sign-in entitlement fix already identified for the iOS build

### Verification before resubmitting

1. In Preview/Test:
   - log in with `apple.review@bonkistudio.com`
   - use the new reset password
   - confirm successful sign-in
   - confirm all 7 products are unlocked

2. In Published/Live:
   - repeat the same login
   - confirm successful sign-in
   - confirm all 7 products are unlocked

3. On a physical iPhone build:
   - open login screen
   - reviewer form is visible immediately
   - enter or autofill reviewer credentials
   - confirm successful sign-in without OTP/email access

### Important note for App Store resubmission
This fixes the reviewer-account blocker. The separate Apple sign-in issue still also needs the native entitlement/capability added in Xcode before resubmitting, otherwise Apple can still reject the build on the Sign in with Apple path.
