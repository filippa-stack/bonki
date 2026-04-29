## Changes

### 1. Include real beta testers (currently missing)

In LIVE `user_product_access` there are 5 access sources:
- `purchase` (6) and `stripe` (9) — paying customers
- `beta_grant` (8), `beta_migration` (38), `manual_grant` (14) — **real beta testers**

Currently the dashboard's funnel + monetization counts only `purchase`, ignoring 60 real beta users.

**Fix in `supabase/functions/get-analytics/index.ts`:**
- Treat `purchase` + `stripe` as "paying"
- Treat `beta_grant` + `beta_migration` + `manual_grant` as "beta testers"
- Add a combined "har tillgång" set = paying ∪ beta
- Funnel last step changes from "Betalat" → "Betalat eller beta-tillgång" using the combined set
- New section "Tillgång (källa)" listing each `granted_via` with counts
- Overview gains `betaUsers` and clearer `paidUsers` counts

### 2. Confirm LIVE-only data + clearer environment badge

The dashboard already pulls from whichever Supabase project the running app is connected to. So:
- Open on **bonkiapp.com/analytics** → LIVE data
- Open on the lovable preview / id-preview URL → TEST data

To remove ambiguity, make this explicit in the UI:
- The header badge already says "LIVE • interna konton exkluderade" — but it lies if you happen to view it from the preview.
- Replace with a **runtime detection** based on `VITE_SUPABASE_URL` host: if the host matches the known LIVE project ref, show a green "LIVE" pill; otherwise show a yellow "TEST" pill that says "Öppna bonkiapp.com/analytics för Live-data".

### 3. Files touched

```
supabase/functions/get-analytics/index.ts   (beta inclusion + access-by-source breakdown)
src/pages/AnalyticsDashboard.tsx            (env badge + new "Tillgång" section)
```

No DB migrations. No new dependencies.
