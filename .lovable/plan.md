# Verify Live `reset-reviewer-password` response

You asked for proof that Live has the new reviewer password seeded. The previous run was performed against production, but the response JSON wasn't pasted back. This plan re-runs the function against **Live** and pastes the full response.

## What I'll do

1. **Call the Live edge function via curl** (no code changes):
   ```
   curl -X POST \
     "https://<LIVE_PROJECT_REF>.supabase.co/functions/v1/reset-reviewer-password?token=bonki-reviewer-reset-9f4e2a1c-2026" \
     -H "Content-Type: application/json"
   ```
   The Live project ref is the one bound to `bonkiapp.com` (separate from the Test ref `wcienwozdurwhswaarjy`). I'll resolve it from the project's environment config before issuing the call.

2. **Paste the full JSON response** back into the chat, e.g.:
   ```json
   {
     "ok": true,
     "userId": "931630a4-e65a-4785-93ab-0d1b83443753",
     "email": "apple.review@bonkistudio.com",
     "passwordReset": true,
     "products": ["jag_i_mig", "jag_i_varlden", "jag_med_andra", "sexualitetskort", "still_us", "syskonkort", "vardagskort"],
     "productCount": 7,
     "accessError": null
   }
   ```

3. **Confirm expected fields**: `ok: true`, `passwordReset: true`, `productCount: 7`. If any field is missing or `ok: false`, I'll surface the error and stop before you ship the next build to Apple.

## Why this needs default mode

The `supabase--curl_edge_functions` tool only targets the **Test** project. Hitting **Live** requires a plain `curl` via `code--exec`, which is disabled in plan mode.

## What I will NOT change

No code, no migrations, no edits to `reset-reviewer-password`. This is a pure verification call. The function is idempotent (uses `ON CONFLICT DO NOTHING` for product access and just re-sets the same password), so re-running it is safe.