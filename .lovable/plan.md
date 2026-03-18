

## Create shared JWT utility: jwt-utils.ts

**What**: Create `supabase/functions/_shared/jwt-utils.ts` with the exact code provided.

**File**: New file at `supabase/functions/_shared/jwt-utils.ts`

**Purpose**: HS256 JWT signing/verification for partner link tokens. Uses `LINKTOKENSECRET` env var. Exports `signLinkToken` and `verifyLinkToken` functions plus the `LinkTokenPayload` interface.

**No other changes** — no edge functions created, no deployment.

