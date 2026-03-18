

## Create shared helper: create-session-state.ts

**What**: Create `supabase/functions/_shared/create-session-state.ts` with the exact code provided.

**File**: New file at `supabase/functions/_shared/create-session-state.ts`

**Purpose**: Shared helper that wraps the `insert_session_state_idempotent` RPC for idempotent session state creation when advancing/skipping cards. Used by multiple code paths (advance_card, skip_card, restart, cron, migrations).

**Dependencies**: The `insert_session_state_idempotent` RPC already exists in the database.

**No other changes** — no edge functions created, no deployment.

