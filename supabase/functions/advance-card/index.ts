// ============================================================
// Still Us — Edge Function: advance-card
// ============================================================
// Input: { couple_id, card_id, takeaway?, partner_takeaway? }
// Returns: { status: 'advanced' | 'ceremony', new_card_index? }
//
// CRITICAL: Writer identity resolved from session_lock.user_id — NOT
// hardcoded to initiator_id. The lock holder may be the partner in Tier 3.
//
// RULE 1: Sequential writes within single invocation
// RULE 2: Tier-aware routing for partner takeaway
// RULE 3: Card 22 (index 21) is terminal — NEVER increment past it
// RULE 4: createSessionStateForCard called for every new card
// RULE 6: dissolved_at guard

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase-client.ts";
import { createSessionStateForCard } from "../_shared/create-session-state.ts";
import { signLinkToken } from "../_shared/jwt-utils.ts";

const TERMINAL_CARD_INDEX = 21;

/** 1-indexed card_id convention: card_index 0 → "card_1", etc. */
function cardIdFromIndex(index: number): string {
  return `card_${index + 1}`;
}

Deno.serve(async (req: Request) => {

  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  const headers = getCorsHeaders(req);

  try {
    const { couple_id, card_id, takeaway, partner_takeaway } = await req.json();

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

    const {
      current_card_index,
      cycle_id,
      initiator_id,
      partner_id,
      partner_tier,
      tier_2_pseudo_id,
      partner_link_token,
    } = couple as {
      current_card_index: number;
      cycle_id: number;
      initiator_id: string;
      partner_id: string | null;
      partner_tier: string;
      tier_2_pseudo_id: string | null;
      partner_link_token: string | null;
    };

    const now = new Date().toISOString();

    // CRITICAL: Resolve writer from session_lock.user_id
    const { data: sessionState } = await supabase
      .from("session_state")
      .select("session_lock")
      .eq("couple_id", couple_id)
      .eq("card_id", card_id)
      .eq("cycle_id", cycle_id)
      .single();

    const lock = sessionState?.session_lock as {
      locked_by_device_id: string;
      locked_at: string;
      user_id: string;
    } | null;

    // Fall back to initiator_id if no lock present (edge case)
    const writerUserId: string = lock?.user_id ?? initiator_id;

    // Write lock holder's takeaway
    if (takeaway !== undefined && takeaway !== null) {
      await supabase.from("user_card_state").upsert(
        { user_id: writerUserId, couple_id, card_id, cycle_id, takeaway },
        { onConflict: "user_id,card_id,cycle_id" }
      );
    }

    // Write partner takeaway — tier-aware (RULE 2)
    if (partner_takeaway !== undefined && partner_takeaway !== null) {
      await writePartnerTakeaway(
        supabase,
        couple_id,
        card_id,
        cycle_id,
        partner_tier,
        partner_id,
        tier_2_pseudo_id,
        partner_link_token,
        partner_takeaway
      );
    }

    // RULE 3: Terminal card guard
    if (current_card_index >= TERMINAL_CARD_INDEX) {
      await supabase.from("couple_state").update({
        current_touch: "complete",
        phase: "ceremony",
        last_activity: now,
      }).eq("couple_id", couple_id);

      // Invalidate journey insights cache
      await supabase
        .from("journey_insights_cache")
        .delete()
        .eq("couple_id", couple_id)
        .eq("cycle_id", cycle_id);

      // No N1 notification on terminal card
      return jsonResponse({ status: "ceremony" }, 200, headers);
    }

    // Advance to next card
    const newCardIndex = current_card_index + 1;
    const newCardId = cardIdFromIndex(newCardIndex);

    await supabase.from("couple_state").update({
      current_card_index: newCardIndex,
      current_touch: "slider",
      last_activity: now,
    }).eq("couple_id", couple_id);

    // RULE 4: Create session_state for new card (CRITICAL invariant)
    await createSessionStateForCard(supabase, couple_id, newCardId, cycle_id, "program");

    // Invalidate journey insights cache
    await supabase
      .from("journey_insights_cache")
      .delete()
      .eq("couple_id", couple_id)
      .eq("cycle_id", cycle_id);

    // Queue N1 notification (new card ready) for both partners
    await enqueueNotification(supabase, couple_id, initiator_id, partner_id, "N1", {
      card_id: newCardId,
      card_index: newCardIndex,
    });

    return jsonResponse({ status: "advanced", new_card_index: newCardIndex }, 200, headers);
  } catch (err) {
    console.error("advance-card error:", err);
    return jsonResponse({ status: "error", message: String(err) }, 500, headers);
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────

async function writePartnerTakeaway(
  supabase: ReturnType<typeof createServiceClient>,
  coupleId: string,
  cardId: string,
  cycleId: number,
  partnerTier: string,
  partnerId: string | null,
  tier2PseudoId: string | null,
  linkToken: string | null,
  takeaway: string
) {
  if (partnerTier === "tier_1") {
    await supabase.from("anonymous_session_takeaway").upsert(
      {
        couple_id: coupleId,
        card_id: cardId,
        cycle_id: cycleId,
        link_token: linkToken ?? "",
        takeaway,
      },
      { onConflict: "couple_id,card_id,cycle_id" }
    );
  } else if (partnerTier === "tier_2" && tier2PseudoId) {
    await supabase.from("user_card_state").upsert(
      { user_id: tier2PseudoId, couple_id: coupleId, card_id: cardId, cycle_id: cycleId, takeaway },
      { onConflict: "user_id,card_id,cycle_id" }
    );
  } else if (partnerTier === "tier_3" && partnerId) {
    await supabase.from("user_card_state").upsert(
      { user_id: partnerId, couple_id: coupleId, card_id: cardId, cycle_id: cycleId, takeaway },
      { onConflict: "user_id,card_id,cycle_id" }
    );
  }
}

async function enqueueNotification(
  supabase: ReturnType<typeof createServiceClient>,
  coupleId: string,
  initiatorId: string,
  partnerId: string | null,
  type: string,
  content: Record<string, unknown> = {}
) {
  const recipients = [initiatorId, partnerId].filter(Boolean) as string[];
  for (const recipientUserId of recipients) {
    await supabase.from("notification_queue").insert({
      couple_id: coupleId,
      recipient_user_id: recipientUserId,
      notification_type: type,
      content,
      scheduled_at: new Date().toISOString(),
    });
  }
}

function jsonResponse(body: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
