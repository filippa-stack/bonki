

## Fix email preview — redeploy auth-email-hook

The templates and edge function code are all in place and correctly branded as Bonki. The previews depend on the `/preview` endpoint of the deployed `auth-email-hook` edge function. If the function hasn't been deployed recently (or a deploy failed), the preview won't load.

### Plan

1. **Redeploy `auth-email-hook`** — deploy the edge function so the `/preview` endpoint is live and accessible from Cloud → Emails.

That's the only step needed. No code changes required — the templates and function code are already correct.

### Files modified
None — deployment only.

