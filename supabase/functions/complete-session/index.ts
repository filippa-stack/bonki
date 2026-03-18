// ============================================================
// Still Us — Edge Function: complete-session
// ============================================================
// Input: {
//   couple_id, card_id, session_number, device_id, session_type,
//   session_1_takeaway?, partner_takeaway?, card_takeaway?
// }
// Returns: { next_state: 'session_2' | 'complete' | 'ceremony' }
//
// CRITICAL: Writer identity resolved from session_lock.user_id — NOT
// hardcoded to initiator_id. In Tier 3 couples the partner may hold
// the device and must have takeaways written to their own user_id.
//
// RULE 1: Sequential writes within single invocation
// RULE 2: Tier-aware routing for partner takeaway writes
// RULE 6: dissolved_at guard

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase-client.ts";

Deno.serve(async (req: Request) => {

  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  const headers = getCorsHeaders(req);

  try {
    const {
      couple_id,
      card_id,
      session_number,
      device_id,
      session_type,
      session_1_takeaway,
      partner_takeaway,
      card_takeaway,
    } = await req.json();

    if (!couple_id || !card_id || session_number === undefined || !device_id) {
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

    const cycle_id: number = couple.cycle_id;
    const current_card_index: number = couple.current_card_index;

    // Load session_state and validate device holds the lock
    const { data: sessionState, error: ssErr } = await supabase
      .from("session_state")
      .select("session_lock, session_1_completed")
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
      user_id: string;
    } | null;

    if (!lock || lock.locked_by_device_id !== device_id) {
      return jsonResponse(
        { status: "error", message: "Device does not hold session lock" },
        403,
        headers
      );
    }

    // CRITICAL: Resolve lock holder's user_id — not hardcoded to initiator
    const lockHolderUserId: string = lock.user_id;

    const now = new Date().toISOString();
    const {
      initiator_id,
      partner_id,
      partner_tier,
      tier_2_pseudo_id,
      partner_link_token,
    } = couple as {
      initiator_id: string;
      partner_id: string | null;
      partner_tier: string;
      tier_2_pseudo_id: string | null;
      partner_link_token: string | null;
    };

    // ── Program Session 1 ─────────────────────────────────────────────────
    if (session_type === "program" && session_number === 1) {
      // Write lock holder's session_1_takeaway (not hardcoded to initiator)
      if (session_1_takeaway !== undefined && session_1_takeaway !== null) {
        await supabase.from("user_card_state").upsert(
          {
            user_id: lockHolderUserId,
            couple_id,
            card_id,
            cycle_id,
            session_1_takeaway,
          },
          { onConflict: "user_id,card_id,cycle_id" }
        );
      }

      // Write partner's takeaway — tier-aware routing (RULE 2)
      if (partner_takeaway !== undefined && partner_takeaway !== null) {
        await writePartnerField(
          supabase,
          couple_id,
          card_id,
          cycle_id,
          partner_tier,
          partner_id,
          tier_2_pseudo_id,
          partner_link_token,
          { session_1_takeaway: partner_takeaway }
        );
      }

      // Mark session 1 complete and advance to session 2
      await supabase
        .from("session_state")
        .update({ session_1_completed: true, current_session: "session_2" })
        .eq("couple_id", couple_id)
        .eq("card_id", card_id)
        .eq("cycle_id", cycle_id);

      await supabase
        .from("couple_state")
        .update({ current_touch: "session_2", last_activity: now })
        .eq("couple_id", couple_id);

      return jsonResponse({ next_state: "session_2" }, 200, headers);
    }

    // ── Program Session 2 ─────────────────────────────────────────────────
    if (session_type === "program" && session_number === 2) {
      // Takeaways are NOT written here — handled by advance-card
      await supabase
        .from("session_state")
        .update({ session_2_completed: true, completed_at: now })
        .eq("couple_id", couple_id)
        .eq("card_id", card_id)
        .eq("cycle_id", cycle_id);

      await supabase
        .from("couple_state")
        .update({ last_activity: now })
        .eq("couple_id", couple_id);

      const nextState = current_card_index === 21 ? "ceremony" : "complete";
      return jsonResponse({ next_state: nextState }, 200, headers);
    }

    // ── Tillbaka session ──────────────────────────────────────────────────
    if (session_type === "tillbaka") {
      // Write card_takeaway for the lock holder only
      if (card_takeaway !== undefined && card_takeaway !== null) {
        await supabase.from("user_card_state").upsert(
          {
            user_id: lockHolderUserId,
            couple_id,
            card_id,
            cycle_id,
            takeaway: card_takeaway,
          },
          { onConflict: "user_id,card_id,cycle_id" }
        );
      }

      await supabase
        .from("session_state")
        .update({ session_1_completed: true, completed_at: now })
        .eq("couple_id", couple_id)
        .eq("card_id", card_id)
        .eq("cycle_id", cycle_id);

      // current_touch → complete. Do NOT advance maintenance_card_index.
      await supabase
        .from("couple_state")
        .update({ current_touch: "complete", last_activity: now })
        .eq("couple_id", couple_id);

      return jsonResponse({ next_state: "complete" }, 200, headers);
    }

    return jsonResponse({ status: "error", message: "Unhandled session branch" }, 400, headers);
  } catch (err) {
    console.error("complete-session error:", err);
    return jsonResponse({ status: "error", message: String(err) }, 500, headers);
  }
});

// ── Tier-aware partner field writer ──────────────────────────────────────

async function writePartnerField(
  supabase: ReturnType<typeof createServiceClient>,
  coupleId: string,
  cardId: string,
  cycleId: number,
  partnerTier: string,
  partnerId: string | null,
  tier2PseudoId: string | null,
  linkToken: string | null,
  fields: { session_1_takeaway?: string; takeaway?: string }
) {
  if (partnerTier === "tier_1") {
    await supabase.from("anonymous_session_takeaway").upsert(
      {
        couple_id: coupleId,
        card_id: cardId,
        cycle_id: cycleId,
        link_token: linkToken ?? "",
        ...fields,
      },
      { onConflict: "couple_id,card_id,cycle_id" }
    );
  } else if (partnerTier === "tier_2" && tier2PseudoId) {
    await supabase.from("user_card_state").upsert(
      {
        user_id: tier2PseudoId,
        couple_id: coupleId,
        card_id: cardId,
        cycle_id: cycleId,
        ...fields,
      },
      { onConflict: "user_id,card_id,cycle_id" }
    );
  } else if (partnerTier === "tier_3" && partnerId) {
    await supabase.from("user_card_state").upsert(
      {
        user_id: partnerId,
        couple_id: coupleId,
        card_id: cardId,
        cycle_id: cycleId,
        ...fields,
      },
      { onConflict: "user_id,card_id,cycle_id" }
    );
  }
}

function jsonResponse(body: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
