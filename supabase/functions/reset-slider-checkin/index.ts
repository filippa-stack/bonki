// ============================================================
// Still Us — Edge Function: reset-slider-checkin
// ============================================================
// Input: { couple_id, card_id }
// Returns: { status: 'ok' | 'dissolved' | 'error' }
//
// Resets slider data for BOTH partners and resets session state.
// Does NOT touch notes or threshold_mood.
// Does NOT change skip_status.
// RULE 1: Single transaction (sequential writes — atomic intent)
// RULE 6: dissolved_at guard

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase-client.ts";

Deno.serve(async (req: Request) => {

  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  const headers = getCorsHeaders(req);

  try {
    const { couple_id, card_id } = await req.json();

    if (!couple_id || !card_id) {
      return jsonResponse({ status: "error", message: "Missing required fields" }, 400, headers);
    }

    const supabase = createServiceClient();

    // RULE 6: dissolved_at guard
    const { data: couple, error: coupleErr } = await supabase
      .from("couple_state")
      .select("*")
      .eq("couple_id", couple_id)
      .single();

    if (coupleErr || !couple) {
      return jsonResponse({ status: "error", message: "Couple not found" }, 404, headers);
    }
    if (couple.dissolved_at) {
      return jsonResponse({ status: "dissolved" }, 200, headers);
    }

    const { cycle_id, initiator_id, partner_id, partner_tier, tier_2_pseudo_id } = couple as {
      cycle_id: number;
      initiator_id: string;
      partner_id: string | null;
      partner_tier: string;
      tier_2_pseudo_id: string | null;
    };

    const now = new Date().toISOString();
    const nullFields = {
      slider_responses: null,
      slider_completed_at: null,
      checkin_reflection: null,
      session_1_takeaway: null,
      takeaway: null,
      reflection_skipped: false,
    };

    // Reset initiator's user_card_state
    await supabase
      .from("user_card_state")
      .update(nullFields)
      .eq("user_id", initiator_id)
      .eq("card_id", card_id)
      .eq("cycle_id", cycle_id);

    // Reset partner's data — tier-aware
    if (partner_tier === "tier_1") {
      // Delete anonymous submission(s) for this card
      await supabase
        .from("anonymous_slider_submission")
        .delete()
        .eq("couple_id", couple_id)
        .eq("card_id", card_id)
        .eq("cycle_id", cycle_id);

      // Null out anonymous_session_takeaway fields
      await supabase
        .from("anonymous_session_takeaway")
        .update({ session_1_takeaway: null, takeaway: null })
        .eq("couple_id", couple_id)
        .eq("card_id", card_id)
        .eq("cycle_id", cycle_id);
    } else if (partner_tier === "tier_2" && tier_2_pseudo_id) {
      await supabase
        .from("user_card_state")
        .update(nullFields)
        .eq("user_id", tier_2_pseudo_id)
        .eq("card_id", card_id)
        .eq("cycle_id", cycle_id);
    } else if (partner_tier === "tier_3" && partner_id) {
      await supabase
        .from("user_card_state")
        .update(nullFields)
        .eq("user_id", partner_id)
        .eq("card_id", card_id)
        .eq("cycle_id", cycle_id);
    }

    // Reset session_state (do NOT change skip_status)
    await supabase
      .from("session_state")
      .update({
        session_1_completed: false,
        session_2_completed: false,
        current_session: "session_1",
        current_step: "oppna",
        current_prompt_index: 0,
        paused_at: null,
        paused_reason: null,
        started_at: null,
        completed_at: null,
        session_lock: null,
      })
      .eq("couple_id", couple_id)
      .eq("card_id", card_id)
      .eq("cycle_id", cycle_id);

    // Set couple current_touch back to slider
    await supabase
      .from("couple_state")
      .update({ current_touch: "slider", last_activity: now })
      .eq("couple_id", couple_id);

    return jsonResponse({ status: "ok" }, 200, headers);
  } catch (err) {
    console.error("reset-slider-checkin error:", err);
    return jsonResponse({ status: "error", message: String(err) }, 500, headers);
  }
});

function jsonResponse(body: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}