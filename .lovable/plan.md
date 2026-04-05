
Goal: fully release `bonkistudio.com` and `www.bonkistudio.com` from the managed edge so Shopify can serve the domain instead of this app.

What I verified
- `https://bonkistudio.com` currently returns `403 Forbidden` with a Cloudflare-branded response.
- `https://www.bonkistudio.com` does the same.
- `https://bonki.lovable.app` still serves the app normally.
- In the codebase, `/login` is only an in-app auth redirect (`src/App.tsx`, `ProtectedRoutes`). That logic only runs after a request reaches the app. The current `403` means the problem is happening before the app loads.

Diagnosis
- This is not a frontend/router bug and not something fixable in the repo.
- The domain is still attached somewhere in the managed custom-domain edge path even after disconnecting it from the project UI.
- Because both apex and `www` are affected, the release needs to cover both hostnames, not just one.

Plan
1. Treat this as an infrastructure incident, not an app change
   - No code changes.
   - No DNS advice loop unless the managed edge mapping is first confirmed removed.

2. Platform-side release required
   - Remove any remaining custom-domain association for:
     - `bonkistudio.com`
     - `www.bonkistudio.com`
   - Purge any orphaned edge hostname/certificate/config still bound to those hosts.
   - Ensure neither hostname resolves through the managed Cloudflare edge for this project anymore.

3. Post-release validation
   - Recheck both `https://bonkistudio.com` and `https://www.bonkistudio.com`.
   - Expected result: no Cloudflare 403, and traffic should land on Shopify’s flow instead.
   - If one host still fails, it means only one hostname was released or another provider-side forwarding rule remains.

4. Fallback only if edge release is confirmed complete
   - Then verify at One.com for hidden conflicts:
     - URL forwarding/web redirect rules
     - leftover `AAAA`/extra `A`/duplicate `CNAME`
     - separate records for apex vs `www`
   - But based on the current behavior, the first action should be edge detachment.

Technical details
```text
Current observed path:
bonkistudio.com / www.bonkistudio.com
-> managed Cloudflare edge
-> 403 Forbidden

Published app:
bonki.lovable.app
-> app loads normally

Code behavior:
If a request reaches the app while logged out, App.tsx redirects to /login.
That is separate from the current 403 issue.
```

Recommended escalation payload
- “Please purge and fully detach `bonkistudio.com` and `www.bonkistudio.com` from the platform’s managed custom-domain/Cloudflare configuration. Both hosts still return Cloudflare 403 externally even after domain disconnect, while the published app remains live at `bonki.lovable.app`. This is blocking Shopify from serving the domain.”

Expected outcome
- Once the managed edge binding is removed, public DNS can route cleanly to Shopify and the Lovable app will remain available only on its published app URL unless a different custom domain is connected later.
