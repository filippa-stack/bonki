

## Replace shared CORS utility

**What**: Replace `supabase/functions/_shared/cors.ts` with the user-provided code.

**Changes**:
- Remove the old hardcoded origin list and `isOriginAllowed`/`handleCors`/`getCorsHeaders` functions
- Add new implementation with regex-based origin matching for `*.lovableproject.com` subdomains
- Add `bonkistudio.com` as primary allowed origins
- Simplify CORS headers (shorter `Allow-Headers` list, add `Allow-Methods`)
- Export a `corsHeaders` constant for simple use cases
- No edge function deployment or other file changes

**Impact**: Existing edge functions (`activate-session`, `update-step-completion`, `create-couple-space`) import `handleCors` and `getCorsHeaders` from this file — both exports are preserved with compatible signatures, so no breaking changes.

**Note**: The simplified `Access-Control-Allow-Headers` drops some Supabase client headers (`x-supabase-client-platform`, etc.). This is fine if those headers aren't critical for your edge function calls.

