// ============================================================
// Still Us — Shared: Supabase Client (Service Role)
// ============================================================
// Uses the service role key so Edge Functions can bypass RLS.
// Never expose the service role key to the client.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export function createServiceClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables."
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

// Convenience: get a raw postgres connection via pg for single-transaction RPCs.
// For complex multi-step transactions we use the Supabase rpc() or raw SQL via pg.
// In Supabase Edge Functions, the preferred pattern is to use supabase.rpc() or
// direct SQL via the postgres extension. We expose the client here.
export { createClient };
