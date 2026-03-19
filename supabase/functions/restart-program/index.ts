// ============================================================
// Still Us — Edge Function: restart-program
// ============================================================
// Input: { couple_id }
// Returns: { status: 'restarted', new_cycle_id: number }
//
// RULE 1: Sequential writes
// RULE 4: createSessionStateForCard called for card 0 of new cycle
// RULE 6: dissolved_at guard
//
// Phase boundaries RESET on restart (cycle_id > 1).
// Couple re-enters at Phase A depth (sliders only, cards 1–7).
// See spec section 1.2.1 — do not change without clinical writer approval.

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase-client.ts";
import { createSessionStateForCard } from "../_shared/create-session-state.ts";
import { signLinkToken } from "../_shared/jwt-utils.ts";

/** 1-indexed card_id convention: card_index 0 → "card_1" */
function cardIdFromIndex(index: number): string {
  return `card_${index + 1}`;
}

Deno.serve(async (req: Request) => {

  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  const headers = getCorsHeaders(req);

  try {
    const { couple_id } = await req.json();

    if (!couple_id) {
      return jsonResponse({ status: "error", message: "Missing couple_id" }, 400, headers);
    }

    const supabase = createServiceClient();

    // RULE 6: dissolved_at guard
    const { data: couple, error: coupleErr } = await supabase
      .from("couple_state")
      .select("dissolved_at, cycle_id, ceremony_reflection")
      .eq("couple_id", couple_id)
      .single();

    if (coupleErr || !couple) {
      return jsonResponse({ status: "error", message: "Couple not found" }, 404, headers);
    }
    if (couple.dissolved_at) {
      return jsonResponse({ status: "dissolved" }, 200, headers);
    }

    const { cycle_id, ceremony_reflection } = couple as {
      cycle_id: number;
      ceremony_reflection: string | null;
    };

    const newCycleId = cycle_id + 1;
    const now = new Date().toISOString();

    // Archive existing ceremony_reflection if present
    if (ceremony_reflection) {
      await supabase.from("ceremony_reflection_archive").upsert(
        {
          couple_id,
          cycle_id,
          reflection: ceremony_reflection,
          created_at: now,
        },
        { onConflict: "couple_id,cycle_id" }
      );
    }

    // Reset couple_state for new cycle
    await supabase.from("couple_state").update({
      ceremony_reflection: null,
      cycle_id: newCycleId,
      current_card_index: 0,
      current_touch: "slider",
      phase: "second_cycle",
      last_activity: now,
    }).eq("couple_id", couple_id);

    // RULE 4: Create session_state for card 0 of new cycle (CRITICAL)
    const firstCardId = cardIdFromIndex(0); // "card_1"
    await createSessionStateForCard(supabase, couple_id, firstCardId, newCycleId, "program");

    return jsonResponse({ status: "restarted", new_cycle_id: newCycleId }, 200, headers);
  } catch (err) {
    console.error("restart-program error:", err);
    return jsonResponse({ status: "error", message: String(err) }, 500, headers);
  }
});

function jsonResponse(body: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}