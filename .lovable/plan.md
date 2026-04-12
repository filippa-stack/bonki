

## Fix: Route auth emails through the custom auth-email-hook

### Root cause (confirmed by logs)

The Supabase Auth hook URI in Live points to:
```
https://api.lovable.dev/projects/1604837d-627c-4368-a714-aa6b770c1b8c/backend/email-hook
```

This Lovable API proxy intercepts all auth email events and sends its own default English template. Your custom `auth-email-hook` edge function never receives the events — it only gets `/preview` requests from the Cloud UI.

The hook reports `"success": true`, so Supabase believes the email was handled. But the proxy sends the default template, not your custom BONKI Swedish template.

### What needs to happen

The Lovable proxy needs to forward auth email events to the deployed `auth-email-hook` edge function instead of handling them with default templates. This is controlled by the project email activation state within Lovable's platform.

### Plan

1. **Re-scaffold auth email templates**
   - Call `scaffold_auth_email_templates` to force the platform to re-register this project's custom auth email hook with the proxy layer
   - This is not about changing template code — it's about triggering the platform reconciliation that tells the proxy "this project has custom templates, forward events to the edge function"

2. **Re-deploy auth-email-hook**
   - Deploy the edge function to ensure the proxy has a valid target to forward to

3. **Verify the routing changed**
   - Trigger a login from the published app
   - Check auth logs: the hook URL should either change or the proxy should now forward to the edge function
   - Check edge function logs: should show `Received auth event` entries instead of only boot/shutdown
   - Check the received email: should be BONKI-branded, Swedish, 6-digit code only

### Why this is different from previous attempts

Previous attempts only re-deployed the edge function. The issue is not the edge function — it's the proxy layer configuration. Re-scaffolding triggers a different reconciliation path that updates how the proxy handles auth events for this project.

### Fallback

If re-scaffolding still doesn't change the proxy behavior, this is a platform-level issue where the proxy's project email forwarding state is stuck. At that point, the correct escalation is to Lovable platform support with the concrete finding: "Auth hook fires to api.lovable.dev proxy successfully, but proxy sends default template instead of forwarding to the project's custom auth-email-hook edge function."

