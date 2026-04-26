## Fix the broken build

### Root cause
`supabase/functions/_shared/supabase-client.ts` line 7 uses:
```ts
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
```

The Deno typecheck step in this sandbox cannot resolve `npm:` specifiers without a `nodeModulesDir: "auto"` config in a `deno.json`. Because every shared Edge Function imports `createServiceClient` from this file, the failure cascades:

- All 14+ functions that depend on `_shared/supabase-client.ts` fail to typecheck → "Could not find a matching package" errors.
- Downstream, every `.from(...)` call resolves to `never`, producing the TS2769 "No overload matches this call" errors at the bottom of the build log.

This is a single-line fix in a single file. My recent edits (Apple nonce, Login.tsx, reset-reviewer-password) did not touch this file or its imports — the typecheck step just got triggered now and surfaced the latent issue.

### The fix
Change line 7 of `supabase/functions/_shared/supabase-client.ts` from:
```ts
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
```
to:
```ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
```

This is the same import style already used by the other Edge Functions in the project (e.g. `reset-reviewer-password/index.ts` line 9 uses `https://esm.sh/@supabase/supabase-js@2.39.7`, `update-step-completion/index.ts` line 6 uses `https://esm.sh/@supabase/supabase-js@2.93.3`). Same SDK, same version (2.45.4), just a resolver Deno can handle without npm tooling.

### Why this is safe for the App Store build
- **Zero runtime behavior change.** The Supabase Edge Functions runtime has always supported both `npm:` and `https://esm.sh/...` and produces identical client objects. The version pin (2.45.4) is preserved.
- **No function logic touched.** Only the import URL changes.
- **No DB, RLS, auth, or routing impact.**
- The three reviewer-critical changes from the previous turn (Apple nonce hashing, Google button hidden on native, Live password reset + product seeding) are unaffected and already deployed/executed.

### Verification after the fix
1. Build passes — all `Check supabase/functions/...` errors and the cascading TS2769 errors disappear together.
2. No need to redeploy edge functions for this change to take effect at runtime — they were already deployed and working before. This is purely a sandbox-typecheck fix so the build can complete.

### Rollback
Revert the one line. No other artifacts to undo.