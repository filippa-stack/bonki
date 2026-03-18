// ============================================================
// Still Us — Edge Function: migrate-tier2-to-tier3
// ============================================================
// Input: { couple_id, new_user_id }
// Returns: { status: 'migrated' | 'retry' | 'dissolved' | 'error', retry_after_seconds? }
//
// Triggered when a Tier 2 partner creates a Bonki account.
// Reassigns all user_card_state and threshold_mood rows from
// tier_2_pseudo_id to the new real user_id.
//
// RULE 1: Sequential writes
// RULE 6: dissolved_at guard
// RULE 7: Session-lock guard
//
// Slider-phase guard (spec section 3.4.3):
// If current_touch = 'slider' and initiator hasn't completed their
// check-in for the current card, return retry after 60s.
// Client retries up to 5 times before calling with force: true.
//
// migration_pending is set to true at the start and false on completion
// or error recovery. While true: SessionFocusShell refuses lock
// acquisition and Home shows "Er data uppdateras. Vänta en stund."

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase-client.ts";

const LOCK_STALE_SECONDS = 180;
const SLIDER_PHASE_RETRY_SECONDS = 60;

/** 1-indexed card_id convention: card_index 0 → "card_1" */
function cardIdFromIndex(index: number): string {
  return `card_${index + 1}`;
}

Deno.serve(async (req: Request) => {

  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  const headers = getCorsHeaders(req);

  try {
    const { couple_id, new_user_id, force } = await req.json();

    if (!couple_id || !new_user_id) {
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

    const {
      cycle_id,
      current_touch,
      current_card_index,
      initiator_id,
      tier_2_pseudo_id,
    } = couple as {
      cycle_id: number;
      current_touch: string;
      current_card_index: number;
      initiator_id: string;
      tier_2_pseudo_id: string | null;
    };

    if (!tier_2_pseudo_id) {
      return jsonResponse(
        { status: "error", message: "No tier_2_pseudo_id found on couple" },
        400,
        headers
      );
    }

    // RULE 7: Session-lock guard
    const { data: sessionRows } = await supabase
      .from("session_state")
      .select("session_lock")
      .eq("couple_id", couple_id);

    const nowMs = Date.now();
    for (const row of sessionRows ?? []) {
      const lock = row.session_lock as {
        locked_by_device_id: string;
        locked_at: string;
      } | null;
      if (lock) {
        const lockAge = (nowMs - new Date(lock.locked_at).getTime()) / 1000;
        if (lockAge <= LOCK_STALE_SECONDS) {
          return jsonResponse(
            { status: "retry", retry_after_seconds: LOCK_STALE_SECONDS },
            200,
            headers
          );
        }
      }
    }

    // Slider-phase guard (skip if force=true — after max retries client forces)
    if (!force && current_touch === "slider") {
      const currentCardId = cardIdFromIndex(current_card_index);
      const { data: initiatorCardState } = await supabase
        .from("user_card_state")
        .select("slider_completed_at")
        .eq("user_id", initiator_id)
        .eq("card_id", currentCardId)
        .eq("cycle_id", cycle_id)
        .maybeSingle();

      if (!initiatorCardState?.slider_completed_at) {
        console.warn(
          `migrate-tier2-to-tier3: slider phase guard for couple ${couple_id}. Retry in ${SLIDER_PHASE_RETRY_SECONDS}s.`
        );
        return jsonResponse(
          { status: "retry", retry_after_seconds: SLIDER_PHASE_RETRY_SECONDS },
          200,
          headers
        );
      }
    } else if (force) {
      console.warn(
        `migrate-tier2-to-tier3: force=true, bypassing slider phase guard for couple ${couple_id}.`
      );
    }

    // Set migration_pending = true (shows warning in Home, blocks session acquisition)
    await supabase
      .from("couple_state")
      .update({ migration_pending: true })
      .eq("couple_id", couple_id);

    try {
      // Reassign all user_card_state rows from pseudo_id to new real user_id
      const { error: cardStateErr } = await supabase
        .from("user_card_state")
        .update({ user_id: new_user_id })
        .eq("user_id", tier_2_pseudo_id)
        .eq("couple_id", couple_id);

      if (cardStateErr) throw cardStateErr;

      // Reassign all threshold_mood rows from pseudo_id to new real user_id
      const { error: moodErr } = await supabase
        .from("threshold_mood")
        .update({ user_id: new_user_id })
        .eq("user_id", tier_2_pseudo_id)
        .eq("couple_id", couple_id);

      if (moodErr) throw moodErr;

      // Update couple_state: partner_id, partner_tier, clear pseudo_id, release migration_pending
      const { error: coupleUpdateErr } = await supabase
        .from("couple_state")
        .update({
          partner_id: new_user_id,
          partner_tier: "tier_3",
          tier_2_pseudo_id: null,
          migration_pending: false,
          last_activity: new Date().toISOString(),
        })
        .eq("couple_id", couple_id);

      if (coupleUpdateErr) throw coupleUpdateErr;
    } catch (innerErr) {
      // Error recovery: release migration_pending to prevent permanent app lock
      await supabase
        .from("couple_state")
        .update({ migration_pending: false })
        .eq("couple_id", couple_id);
      throw innerErr;
    }

    return jsonResponse({ status: "migrated" }, 200, headers);
  } catch (err) {
    console.error("migrate-tier2-to-tier3 error:", err);
    return jsonResponse({ status: "error", message: String(err) }, 500, headers);
  }
});

function jsonResponse(body: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}