

## Pre-Publish Status

The two critical fixes (Stripe fallback URLs → bonkiapp.com, CORS allowlist → bonkiapp.com) are already applied and deployed. The app is published and public at `bonki.lovable.app`. Secrets (Stripe, Meta, Resend) are all configured.

## Remaining Issues (Minor)

### 1. Twitter meta tag references `@bonkistudio`
**File:** `index.html` line 43
`<meta name="twitter:site" content="@bonkistudio" />` — update to your new Twitter/X handle if you have one, or remove it.

### 2. Analytics admin list references old email
**File:** `supabase/functions/get-analytics/index.ts` line 11
Comment says `emma@bonkistudio.com` — cosmetic only (the UUID is what matters), but worth updating for clarity.

### 3. "Edit with Lovable" badge is visible
The badge is currently shown on your published app. You can hide it if you're on a paid plan.

### 4. Custom domain not yet connected
`bonkiapp.com` is not connected as a custom domain to this project. Until you connect it in **Project Settings → Domains**, visitors to `bonkiapp.com` won't reach your app. You'll need to:
- Add `bonkiapp.com` and `www.bonkiapp.com` in the domain settings
- Point DNS A records for `@` and `www` to `185.158.133.1`
- Add the TXT verification record Lovable provides

---

**Items 1-2** are quick cosmetic edits. **Item 3** is a setting toggle. **Item 4** is the most important — without it, your new domain doesn't serve the app.

