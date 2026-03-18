// ============================================================
// Still Us — Edge Function: migrate-anonymous-submissions
// ============================================================
// Input: { couple_id, new_user_id }
// Returns: { status: 'migrated' | 'retry' | 'dissolved' | 'error', retry_after_seconds? }
//
// Triggered when a Tier 1 partner creates a Bonki account.
// Migrates all anonymous_slider_submission and anonymous_session_takeaway
// rows into user_card_state for the new user.
//
// RULE 1: Sequential writes
// RULE 6: dissolved_at guard
// RULE 7: Session-lock guard

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase-client.ts";

const LOCK_STALE_SECONDS = 180;
const PHASE_C_START_DISPLAY = 15; // card_15 = card_index 14 = Phase C start

/**
 * Derive card_index (0-based) from card_id string "card_N" (1-indexed).
 * Returns -1 if the format is unrecognized.
 */
function cardIndexFromId(cardId: string): number {
  const match = cardId.match(/^card_(\d+)$/);
  if (!match) return -1;
  return parseInt(match[1], 10) - 1;
}

Deno.serve(async (req: Request) => {

  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  const headers = getCorsHeaders(req);

  try {
    const { couple_id, new_user_id } = await req.json();

    if (!couple_id || !new_user_id) {
      return jsonResponse({ status: "error", message: "Missing required fields" }, 400, headers);
    }

    const supabase = createServiceClient();

    // RULE 6: dissolved_at guard
    const { data: couple, error: coupleErr } = await supabase
      .from("couple_state")
      .select("dissolved_at, cycle_id")
      .eq("couple_id", couple_id)
      .single();

    if (coupleErr || !couple) {
      return jsonResponse({ status: "error", message: "Couple not found" }, 404, headers);
    }
    if (couple.dissolved_at) {
      return jsonResponse({ status: "dissolved" }, 200, headers);
    }

    // RULE 7: Session-lock guard — check all session_state rows for this couple
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

    // Fetch all anonymous slider submissions for this couple
    const { data: anonSliders } = await supabase
      .from("anonymous_slider_submission")
      .select("*")
      .eq("couple_id", couple_id);

    // Fetch all anonymous session takeaways for this couple
    const { data: anonTakeaways } = await supabase
      .from("anonymous_session_takeaway")
      .select("*")
      .eq("couple_id", couple_id);

    // Build a map of card_id → takeaway data
    const takeawayMap = new Map<
      string,
      { session_1_takeaway?: string; takeaway?: string; cycle_id?: number }
    >();
    for (const row of anonTakeaways ?? []) {
      takeawayMap.set(row.card_id, {
        session_1_takeaway: row.session_1_takeaway,
        takeaway: row.takeaway,
        cycle_id: row.cycle_id,
      });
    }

    // Track which card_ids have been upserted from slider submissions
    const processedCardIds = new Set<string>();

    // Upsert user_card_state from anonymous slider submissions
    for (const sub of anonSliders ?? []) {
      const cardIdx = cardIndexFromId(sub.card_id);
      // Phase C check: card_index >= 14 (display weeks 15–22)
      const isPhaseC = cardIdx >= 14;
      const reflectionSkipped = isPhaseC && !sub.checkin_reflection;
      const takeawayData = takeawayMap.get(sub.card_id) ?? {};

      await supabase.from("user_card_state").upsert(
        {
          user_id: new_user_id,
          couple_id,
          card_id: sub.card_id,
          cycle_id: sub.cycle_id,
          slider_responses: sub.slider_responses,
          slider_completed_at: sub.submitted_at,
          checkin_reflection: sub.checkin_reflection ?? null,
          reflection_skipped: reflectionSkipped,
          session_1_takeaway: takeawayData.session_1_takeaway ?? null,
          takeaway: takeawayData.takeaway ?? null,
        },
        { onConflict: "user_id,card_id,cycle_id" }
      );

      processedCardIds.add(sub.card_id);
    }

    // Handle takeaway rows with no corresponding slider submission
    for (const [cardId, takeawayData] of takeawayMap) {
      if (!processedCardIds.has(cardId)) {
        await supabase.from("user_card_state").upsert(
          {
            user_id: new_user_id,
            couple_id,
            card_id: cardId,
            cycle_id: takeawayData.cycle_id ?? couple.cycle_id,
            session_1_takeaway: takeawayData.session_1_takeaway ?? null,
            takeaway: takeawayData.takeaway ?? null,
          },
          { onConflict: "user_id,card_id,cycle_id" }
        );
      }
    }

    // Delete all anonymous rows for this couple
    await supabase
      .from("anonymous_slider_submission")
      .delete()
      .eq("couple_id", couple_id);

    await supabase
      .from("anonymous_session_takeaway")
      .delete()
      .eq("couple_id", couple_id);

    // Update couple_state: partner_id → new_user_id, partner_tier → tier_3
    await supabase.from("couple_state").update({
      partner_id: new_user_id,
      partner_tier: "tier_3",
      last_activity: new Date().toISOString(),
    }).eq("couple_id", couple_id);

    return jsonResponse({ status: "migrated" }, 200, headers);
  } catch (err) {
    console.error("migrate-anonymous-submissions error:", err);
    return jsonResponse({ status: "error", message: String(err) }, 500, headers);
  }
});

function jsonResponse(body: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}