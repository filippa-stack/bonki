
Goal: create the missing Live email queues, then verify the entire auth-email pipeline end to end.

What I verified in Live just now
- `pgmq` is installed.
- The `process-email-queue` cron job exists and is active on a 5-second schedule.
- `public.email_send_log`, `public.email_send_state`, and `public.enqueue_email` all exist.
- `pgmq.q_auth_emails` and `pgmq.q_transactional_emails` do not exist in Live.
- `public.email_send_log` is completely empty in Live.

Important nuance
- The current Live `enqueue_email` and `read_email_batch` functions are the auto-create versions: if a queue table is missing, they attempt to create it on first use.
- So the missing queue tables are real, but they also suggest the Live flow still has not successfully gone through the queue path yet.
- Manually creating the queues is still a safe and sensible unblocker for your requested verification.

Plan
1. Create the two missing Live queues
   - Run these in the Live database:
   ```sql
   SELECT pgmq.create('auth_emails');
   SELECT pgmq.create('transactional_emails');
   ```
   - If direct Live writes are not available from the agent side, use Cloud SQL with Live selected for these exact statements.

2. Re-check Live immediately after creation
   - Confirm `pgmq.q_auth_emails` and `pgmq.q_transactional_emails` now exist.
   - Confirm cron is still active.
   - Confirm `email_send_log` is still empty before the next test so we get a clean signal.

3. Trigger one real login from the published app
   - Use the current OTP login flow from the production site.
   - This should exercise: auth hook → enqueue → queue → cron dispatcher → delivery.

4. Verify the chain in order
   - `auth-email-hook` logs:
     - expect `Received auth event`
     - then `Auth email enqueued` or an enqueue failure
   - Live database:
     - expect new `email_send_log` rows (`pending`, then `sent` or `failed`)
   - `process-email-queue` logs:
     - expect activity reading `auth_emails` and attempting send

5. Interpret the result precisely
   - If queue tables exist but `auth-email-hook` still gets zero new invocations:
     - routing/binding is still broken upstream
   - If the hook logs an enqueue failure:
     - queue access/RPC/runtime issue inside the hook path
   - If the hook enqueues and dispatcher logs a send attempt but no email arrives:
     - delivery/provider path is the blocker
   - If `sent` appears in `email_send_log`:
     - the backend chain is working and any remaining issue is inbox/provider-side

Technical details
- This is a safe Live-only infrastructure correction, not a destructive schema change.
- The missing queues explain why nothing can be drained even with cron present.
- But because the Live RPCs already contain queue auto-creation logic, queue absence alone is probably not the whole story; the post-create login test is the key proof point.
