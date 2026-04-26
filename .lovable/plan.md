# Stop iOS build: verify actual Live backend and reviewer reset

I will not proceed with the iOS build until the production backend mismatch is resolved.

## Confirmed from read-only inspection

- Project memory says the intended environment split is:
  - Test/Preview: `wcienwozdurwhswaarjy`
  - Live/Production: `spgknasuinxmvyrlpztx`
- `supabase/config.toml` is currently bound to Test: `wcienwozdurwhswaarjy`.
- The generated web client uses build-time env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`), so the actual backend used by `bonkiapp.com` depends on the Live deployment environment, not the checked-in Test config.
- A read-only Live query confirms product access exists for UID `f05b6b17-d7b6-48f1-ae6d-77fe2ff28711`, and not for `931630a4-...` in the currently selected production environment.
- No production logs were found for `reset-reviewer-password`, which supports your concern that the previous reset may not have hit `spgknasuinxmvyrlpztx`.

## What I will do in default mode

1. **Identify the backend that `bonkiapp.com` is actually using**
   - Fetch the production JS bundle from `https://bonkiapp.com`.
   - Search it for the embedded backend URL/project ref.
   - Confirm whether the live app points to:
     - `https://spgknasuinxmvyrlpztx.supabase.co`, or
     - a different project, including the one that returned UID `931630a4-...`.

2. **Call the reset function against the correct production project explicitly**
   - If `bonkiapp.com` points to `spgknasuinxmvyrlpztx`, call:
     ```text
     https://spgknasuinxmvyrlpztx.supabase.co/functions/v1/reset-reviewer-password?token=bonki-reviewer-reset-9f4e2a1c-2026
     ```
   - Paste the full response and include the exact URL called.

3. **Validate the UID requirement**
   - The response must show:
     ```json
     {
       "ok": true,
       "userId": "f05b6b17-d7b6-48f1-ae6d-77fe2ff28711",
       "email": "apple.review@bonkistudio.com",
       "passwordReset": true,
       "productCount": 7
     }
     ```
   - If the response shows any other UID, I will stop and report that the reset is still targeting the wrong backend.

4. **If the function is missing or stale on `spgknasuinxmvyrlpztx`**
   - Deploy or publish the current `reset-reviewer-password` function to the actual Live backend.
   - Re-run the explicit production URL.
   - Paste the final successful response.

5. **Report environment mapping clearly**
   - I will give you a concise table:
     ```text
     bonkiapp.com backend: <project ref found in production bundle>
     reset URL called:    <full function URL>
     response UID:        <uid returned>
     expected UID:        f05b6b17-d7b6-48f1-ae6d-77fe2ff28711
     productCount:        7
     safe for iOS build:  yes/no
     ```

## What I will not do

- No iOS build.
- No App Store submission.
- No unrelated code changes.
- No assumptions that `931630a4-...` is Live unless the production app bundle proves it.