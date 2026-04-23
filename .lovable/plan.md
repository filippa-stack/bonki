

## Apple Sign In config — answers + what to fix

### 1. Where the Key ID lives

The Key ID (`Y37T9LJYAL`) is **not a separate field on the main Apple provider screen**. It is asked **inside the "Generate secret" dialog** that appears when you click **Generate Secret** under the Client Secret JWT field.

That dialog asks for, in this order:
- Team ID
- Key ID ← this is where `Y37T9LJYAL` goes
- Services ID (Client ID)
- Contents of the `.p8` private key (paste the full file including `-----BEGIN PRIVATE KEY-----` lines)

It then signs a JWT with header `{ alg: "ES256", kid: "<Key ID>" }` and writes the result into the Client Secret field on the main provider screen. Without the Key ID inside that dialog, the JWT header would be wrong and Apple would reject token exchange.

**Action**: Open Cloud → Authentication → Sign In Methods → Apple → Generate Secret, fill all four fields including Key ID `Y37T9LJYAL`, generate, and save.

### 2. The Key ID is NOT auto-derived from the .p8 file

The `.p8` file does not contain its own Key ID — the Key ID only exists in Apple's developer console next to that key. So Lovable cannot derive it for you. You must enter it manually inside the Generate Secret dialog.

### 3. The aud claim and native iOS Bundle ID — this is the important issue

The current `apple.review` setup has a real mismatch you need to fix.

**Today on the main Apple provider screen**:
- Client ID = `com.bonkistudio.bonkiapp.signin` (your **Services ID**, used for web OAuth)

**But your native iOS app sends**:
- `appleSignIn.ts` line 13 → `APPLE_CLIENT_ID = 'com.bonkistudio.bonkiapp'` (your **Bundle ID**)
- Apple issues an identity token with `aud = com.bonkistudio.bonkiapp`
- Supabase receives it via `signInWithIdToken({ provider: 'apple', token })`
- Supabase compares the token's `aud` to the configured Client ID → **mismatch → rejected**

This is almost certainly why native Apple sign-in fails for the reviewer even after the entitlement is added.

**Fix**: Add `com.bonkistudio.bonkiapp` to the **Additional allowed client IDs / Authorized Client IDs** field on the Apple provider screen. In Lovable Cloud the field appears directly under the Client ID input (sometimes labeled "Additional client IDs", comma-separated). After saving, the final config should be:

- **Client ID**: `com.bonkistudio.bonkiapp.signin`
- **Additional allowed client IDs**: `com.bonkistudio.bonkiapp`
- **Team ID**: `459423SKW4`
- **Key ID** (inside Generate Secret): `Y37T9LJYAL`
- **Client Secret**: JWT generated from the dialog using the four values above

If your Cloud UI does not expose an "Additional allowed client IDs" field, the alternative is to switch the main Client ID to the Bundle ID `com.bonkistudio.bonkiapp` — but that breaks any future web Apple OAuth using the Services ID. Adding it as an additional audience is the correct setup.

### 4. Verifying the JWT payload is correct

A correctly generated JWT for your config will, when decoded, contain:
```
header:  { alg: "ES256", kid: "Y37T9LJYAL", typ: "JWT" }
payload: {
  iss: "459423SKW4",
  iat: <recent>,
  exp: <iat + ~6 months>,
  aud: "https://appleid.apple.com",
  sub: "com.bonkistudio.bonkiapp.signin"
}
```

Note that `sub` is the Services ID — this is the JWT's identity to Apple, **not** the audience for incoming user tokens. The user-token audience matching (Bundle ID vs Services ID) is what the "Additional allowed client IDs" field controls and is independent of this JWT.

You can paste the generated JWT into jwt.io to confirm `kid`, `iss`, and `sub` look like the above before saving.

### 5. Apple Developer console — also required

In `developer.apple.com` → Identifiers → your **Services ID** `com.bonkistudio.bonkiapp.signin` → "Sign In with Apple" → Configure:
- **Primary App ID**: must be `com.bonkistudio.bonkiapp` (your iOS app)
- **Domains**: `bonkiapp.com`, `www.bonkiapp.com`, `bonki.lovable.app`
- **Return URLs**: `https://wcienwozdurwhswaarjy.supabase.co/auth/v1/callback`

The Primary App ID link is what makes the Bundle ID and Services ID share the same Apple-issued user identifier, so a user signing in natively (Bundle ID audience) and via web (Services ID audience) is the same account in your database.

### 6. Summary checklist

- [ ] Open Generate Secret dialog, enter Team ID, **Key ID `Y37T9LJYAL`**, Services ID, paste `.p8`, generate, save.
- [ ] On the Apple provider screen, add `com.bonkistudio.bonkiapp` to **Additional allowed client IDs**.
- [ ] In Apple Developer console, confirm the Services ID's Primary App ID is the Bundle ID, and the Return URL points to the Supabase callback.
- [ ] Set a calendar reminder ~5 months out: the JWT expires at 6 months and must be regenerated.

Once those three are done your native iOS Sign in with Apple flow will succeed end-to-end. No code changes are needed in `appleSignIn.ts` — it is already correct.

