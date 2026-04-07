

## Update send-notification-email to use Resend connector

### What's changing

The `send-notification-email` edge function currently calls the Resend API directly using the old `RESEND_API_KEY` secret. We'll switch it to use the Resend connector gateway with `RESEND_API_KEY_1`, which provides automatic token refresh.

The `auth-email-hook` does **not** use Resend — it enqueues emails via the Lovable email queue system. No changes needed there.

### Plan

1. **Update `send-notification-email/index.ts`**
   - Replace `Deno.env.get("RESEND_API_KEY")` with `Deno.env.get("RESEND_API_KEY_1")`
   - Add `LOVABLE_API_KEY` env var check
   - Change the Resend API call from direct (`https://api.resend.com/emails`) to gateway (`https://connector-gateway.lovable.dev/resend/emails`) with proper `Authorization` and `X-Connection-Api-Key` headers

2. **Deploy** the updated edge function

### Files modified
- `supabase/functions/send-notification-email/index.ts`

