# Sofia access + Google login on preview

## Diagnosis

### 1. Why Sofia still has no access (the real cause)

The auth logs show that **sofia.wigen@gmail.com in Test has user_id `4ab87a29-0645-4551-9182-5467827bc963`**.

Earlier we inserted `user_product_access` rows for user_id `097faf41-7076-47f7-86b5-5d4ac3c6d0b9`. That ID belongs to her **Live** account — it does not exist in Test.

So in the **preview link (Test environment)** she is logged in as `4ab87a29...`, and that user has zero rows in `user_product_access`. The grants we ran landed on the wrong account in Test.

The Live grant (097faf41) is correct and will work when she uses bonkiapp.com.

**Fix:** insert the 7 grants for `4ab87a29-0645-4551-9182-5467827bc963` in the **Test** database. After that she should hard-refresh / sign out + back in on the preview link.

### 2. Why "Login with Google" doesn't work on the preview link

The preview URL is `id-preview--1604837d-627c-4368-a714-aa6b770c1b8c.lovable.app`. Two things combine to break Google OAuth there:

- **Preview links are gated by Lovable login by default.** When the OAuth flow returns to `window.location.origin` (the preview host), Lovable's preview gate intercepts the redirect before our app can consume the tokens. Sofia is not a workspace member, so the gate blocks her and the session is lost.
- Magic Link / email OTP works for her because it doesn't depend on a return-to-origin redirect that the preview gate blocks (the auth log confirms she successfully signed in via OTP at 09:55:59).

This is a **platform constraint of preview links**, not a bug in our Login page or in the managed Google OAuth setup. Google login works fine on the published site (`bonkiapp.com`).

**Recommended fix for Sofia's testing:**
- Have her keep using **email magic link** on the preview link (already proven to work for her), OR
- Generate a **Share preview** link (Share → Share preview) — public 7-day link that doesn't require Lovable login. Google OAuth should complete on a Share preview link because the preview gate is removed.

No code change needed for #2 — it is a platform behaviour to communicate.

## Plan

1. **Grant access in Test for the correct user_id**
   - Insert 7 rows into Test `user_product_access` for `4ab87a29-0645-4551-9182-5467827bc963` (one per product), `granted_via = 'admin_grant'`, `ON CONFLICT DO NOTHING`.
   - Verify by querying Test.

2. **Tell Sofia how to unblock herself on preview**
   - Hard refresh / sign out + sign back in on the preview link to pick up the new access rows.
   - Use **email magic link** on the preview (Google OAuth won't complete through the Lovable preview gate).
   - Or switch to a **Share preview** link if you want Google OAuth to work for her.

3. **No code changes.** Login page and managed Google OAuth are configured correctly; the issue is the preview gate, not our code.

## Technical notes

- Test and Live are isolated Supabase projects; the same email gets a different `auth.users.id` in each. Any per-user data grants must be repeated against the correct user_id per environment.
- `lovable.auth.signInWithOAuth` redirects through `oauth.lovable.app` and then back to `window.location.origin`. On preview hosts, the Lovable login interstitial breaks the return leg for non-workspace users. Share-preview links and the published domain don't have this interstitial.
