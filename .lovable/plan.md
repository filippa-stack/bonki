
Goal: restore Live auth-email routing so real OTP emails go through your custom Swedish templates instead of the default English proxy template.

What’s already confirmed
- The app is requesting OTP correctly in `src/pages/Login.tsx` (`signInWithOtp` + 6-digit `verifyOtp` flow).
- The custom auth email function is ready to work: `auth-email-hook` logs a `pending` row to `email_send_log` before enqueueing.
- Because `email_send_log` has zero rows in Live, the hook is not being invoked for real auth events.
- The queue/cron/database side is no longer the blocker.

What this means
- This is not a frontend bug, template bug, or queue bug.
- The remaining failure is the managed auth-email routing layer in Live.
- No more app-code changes should be made until routing is fixed.

Plan
1. Inspect the Live auth email routing configuration in the managed backend
   - Confirm the project’s auth email routing is still bound to the managed proxy path instead of forwarding to the project hook.
   - Check whether the project email routing flags are fully enabled in Live, not just domain verification.

2. Repair the Live routing binding
   - First choice: fix the proxy mapping so auth events are forwarded to the project’s `auth-email-hook`.
   - Fallback: if the platform supports it for this project, switch the Send Email hook to the production function endpoint directly.
   - Do not change templates, login flow, queue code, or cron again.

3. Re-verify end to end in Live
   - Trigger one real login from the published app.
   - Confirm `auth-email-hook` logs show `Received auth event`.
   - Confirm `email_send_log` gets rows (`pending` then `sent`/`failed`).
   - Confirm the user receives the Swedish OTP-code email, not the default English link template.

4. If routing still bypasses the hook, escalate as a platform incident immediately
   - Package the exact evidence:
     - published app uses OTP flow
     - Live hook is deployed
     - queues/cron/log table exist
     - `email_send_log` remains empty
     - proxy URL is handling auth emails itself instead of forwarding
   - Requested fix: re-bind Live auth email routing for this project so auth events reach the custom hook.

Technical details
- The strongest proof is the zero-row `email_send_log`: your hook writes there before queueing, so an empty table means the hook never ran.
- Once routing is repaired, the existing delivery chain should already work: hook → enqueue → queue → cron → send.
- This should be treated as a backend/platform configuration repair, not a code implementation task.

Expected outcome
- Best case: Live proxy forwarding is corrected and the next login sends the branded Swedish OTP email.
- If not fixable from project controls, we move straight to platform escalation with enough evidence to resolve it without more guesswork.
