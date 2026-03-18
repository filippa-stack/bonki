// ============================================================
// Still Us — Edge Function: dissolve-couple
// ============================================================
// Input: { couple_id, departing_user_id }
// Returns: { status: 'dissolved' | 'already_dissolved' | 'error' }
//
// RULE 1: Sequential writes
// Dissolution effects:
// - Sets dissolved_at and dissolved_by
// - Nulls partner_link_token, sets migration_pending → false
// - Nulls session_lock on all session_state rows for this couple
// - Deletes journey_insights_cache for this couple

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase-client.ts";

Deno.serve(async (req: Request) => {

  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  const headers = getCorsHeaders(req);

  try {
    const { couple_id, departing_user_id } = await req.json();

    if (!couple_id || !departing_user_id) {
      return jsonResponse({ status: "error", message: "Missing required fields" }, 400, headers);
    }

    const supabase = createServiceClient();

    const { data: couple, error: coupleErr } = await supabase
      .from("couple_state")
      .select("couple_id, dissolved_at")
      .eq("couple_id", couple_id)
      .single();

    if (coupleErr || !couple) {
      return jsonResponse({ status: "error", message: "Couple not found" }, 404, headers);
    }

    // Idempotent: already dissolved
    if (couple.dissolved_at) {
      return jsonResponse({ status: "already_dissolved" }, 200, headers);
    }

    const now = new Date().toISOString();

    // 1. Set dissolved_at, dissolved_by, null partner_link_token, migration_pending false
    const { error: dissolveErr } = await supabase
      .from("couple_state")
      .update({
        dissolved_at: now,
        dissolved_by: departing_user_id,
        partner_link_token: null,
        migration_pending: false,
        last_activity: now,
      })
      .eq("couple_id", couple_id);

    if (dissolveErr) throw dissolveErr;

    // 2. Null session_lock on all session_state rows for this couple
    const { error: lockErr } = await supabase
      .from("session_state")
      .update({ session_lock: null })
      .eq("couple_id", couple_id);

    if (lockErr) throw lockErr;

    // 3. Delete journey_insights_cache for this couple
    await supabase
      .from("journey_insights_cache")
      .delete()
      .eq("couple_id", couple_id);

    return jsonResponse({ status: "dissolved" }, 200, headers);
  } catch (err) {
    console.error("dissolve-couple error:", err);
    return jsonResponse({ status: "error", message: String(err) }, 500, headers);
  }
});

function jsonResponse(body: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}