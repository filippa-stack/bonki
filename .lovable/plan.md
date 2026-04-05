

## Pre-Publish Fix Plan (Final)

Two changes only. No routing changes.

### 1. Fix Stripe checkout fallback URLs
**File:** `supabase/functions/create-checkout/index.ts`

Replace the two hardcoded fallback URLs:
- `success_url` → `https://bonkiapp.com/?purchase=success`
- `cancel_url` → `https://bonkiapp.com/?purchase=cancel`

### 2. Update CORS allowlist
**File:** `supabase/functions/_shared/cors.ts`

Replace `bonkistudio.com` / `www.bonkistudio.com` with `bonkiapp.com` / `www.bonkiapp.com` in `ALLOWED_ORIGINS`.

---

No routing changes. No database migrations. Edge functions redeploy automatically.

