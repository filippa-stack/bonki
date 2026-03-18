// ============================================================
// Still Us — Edge Function: session-heartbeat
// ============================================================
// Input: { couple_id, card_id, device_id }
// Returns: { status: 'ok' | 'taken_over' | 'migration_in_progress' | 'error' }
//
// Called every 60 seconds by the active session device to keep the lock alive.

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase-client.ts";

Deno.serve(async (req: Request) => {

  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  const headers = getCorsHeaders(req);

  try {
    const { couple_id, card_id, device_id } = await req.json();

    if (!couple_id || !card_id || !device_id) {
      return jsonResponse({ status: "error", message: "Missing required fields" }, 400, headers);
    }

    const supabase = createServiceClient();

    // Check couple state for migration_pending
    const { data: couple, error: coupleErr } = await supabase
      .from("couple_state")
      .select("migration_pending, cycle_id")
      .eq("couple_id", couple_id)
      .single();

    if (coupleErr || !couple) {
      return jsonResponse({ status: "error", message: "Couple not found" }, 404, headers);
    }

    if (couple.migration_pending) {
      return jsonResponse({ status: "migration_in_progress" }, 200, headers);
    }

    const cycle_id = couple.cycle_id;

    // Read session lock
    const { data: sessionState, error: ssErr } = await supabase
      .from("session_state")
      .select("session_lock")
      .eq("couple_id", couple_id)
      .eq("card_id", card_id)
      .eq("cycle_id", cycle_id)
      .single();

    if (ssErr || !sessionState) {
      return jsonResponse({ status: "error", message: "Session state not found" }, 404, headers);
    }

    const lock = sessionState.session_lock as {
      locked_by_device_id: string;
      locked_at: string;
    } | null;

    if (!lock) {
      return jsonResponse({ status: "taken_over" }, 200, headers);
    }

    if (lock.locked_by_device_id !== device_id) {
      return jsonResponse({ status: "taken_over" }, 200, headers);
    }

    // Refresh locked_at
    const { error: updateErr } = await supabase
      .from("session_state")
      .update({
        session_lock: {
          locked_by_device_id: device_id,
          locked_at: new Date().toISOString(),
        },
      })
      .eq("couple_id", couple_id)
      .eq("card_id", card_id)
      .eq("cycle_id", cycle_id);

    if (updateErr) throw updateErr;

    return jsonResponse({ status: "ok" }, 200, headers);
  } catch (err) {
    console.error("session-heartbeat error:", err);
    return jsonResponse({ status: "error", message: String(err) }, 500, headers);
  }
});

function jsonResponse(body: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
