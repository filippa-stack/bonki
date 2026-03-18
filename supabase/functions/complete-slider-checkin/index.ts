// ============================================================
// Still Us — Edge Function: complete-slider-checkin
// ============================================================
// Input: { user_id?, couple_id, card_id, slider_responses, checkin_reflection?, link_token? }
// Returns: { status: 'waiting' | 'ready' | 'already_submitted' | 'dissolved' | 'error' }
//
// RULES:
// - Rule 1: Single transaction
// - Rule 2: Tier-aware routing
// - Rule 5: Idempotency guard
// - Rule 6: dissolved_at guard

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase-client.ts";
import { verifyLinkToken } from "../_shared/jwt-utils.ts";

// Phase boundaries (card_index, 0-based)
const PHASE_A_END = 6;   // cards 0–6
const PHASE_B_END = 13;  // cards 7–13
const PHASE_C_START = 14; // cards 14–21

Deno.serve(async (req: Request) => {

  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  const headers = getCorsHeaders(req);

  try {
    const body = await req.json();
    const {
      user_id,
      couple_id: bodyCouplId,
      card_id: bodyCardId,
      slider_responses,
      checkin_reflection,
      link_token,
    } = body;

    const supabase = createServiceClient();

    // ── Resolve couple_id and card_id ──────────────────────────────────────
    let couple_id = bodyCouplId;
    let card_id = bodyCardId;
    let isAnonymous = false;
    let tokenPayload: Awaited<ReturnType<typeof verifyLinkToken>> | null = null;

    if (link_token) {
      // Tier 1 partner: validate JWT
      tokenPayload = await verifyLinkToken(link_token);
      couple_id = tokenPayload.couple_id;
      card_id = tokenPayload.card_id;
      isAnonymous = true;
    }

    // ── Load couple_state ─────────────────────────────────────────────────
    const { data: couple, error: coupleErr } = await supabase
      .from("couple_state")
      .select("*")
      .eq("couple_id", couple_id)
      .single();

    if (coupleErr || !couple) {
      return jsonResponse({ status: "error", message: "Couple not found" }, 404, headers);
    }

    // RULE 6: dissolved_at guard
    if (couple.dissolved_at) {
      return jsonResponse({ status: "dissolved" }, 200, headers);
    }

    // ── Validate slider_responses ─────────────────────────────────────────
    if (!Array.isArray(slider_responses) || slider_responses.length === 0) {
      return jsonResponse({ status: "error", message: "Invalid slider_responses" }, 400, headers);
    }
    const allCenter = slider_responses.every(
      (s: { position: number }) => s.position === 50
    );
    if (allCenter) {
      return jsonResponse(
        { status: "error", message: "At least one slider must be moved from center" },
        400,
        headers
      );
    }

    // ── Determine caller role and resolve writer user_id ──────────────────
    const { partner_tier, initiator_id, partner_id, tier_2_pseudo_id, cycle_id, current_card_index, current_touch } =
      couple;

    // ── RULE 5: Idempotency guard ─────────────────────────────────────────
    // If current_touch is NOT 'slider', check if caller already submitted.
    if (current_touch !== "slider") {
      if (isAnonymous) {
        const { data: existing } = await supabase
          .from("anonymous_slider_submission")
          .select("id")
          .eq("couple_id", couple_id)
          .eq("card_id", card_id)
          .eq("cycle_id", cycle_id)
          .maybeSingle();
        if (existing) return jsonResponse({ status: "ready" }, 200, headers);
      } else {
        const writerId = resolveWriterId(
          user_id,
          isAnonymous,
          partner_tier,
          initiator_id,
          partner_id,
          tier_2_pseudo_id
        );
        if (writerId) {
          const { data: existing } = await supabase
            .from("user_card_state")
            .select("slider_completed_at")
            .eq("user_id", writerId)
            .eq("card_id", card_id)
            .eq("cycle_id", cycle_id)
            .maybeSingle();
          if (existing?.slider_completed_at) return jsonResponse({ status: "ready" }, 200, headers);
        }
      }
    } else {
      // current_touch IS 'slider' but check if this caller already submitted
      if (isAnonymous) {
        const { data: existing } = await supabase
          .from("anonymous_slider_submission")
          .select("id")
          .eq("couple_id", couple_id)
          .eq("card_id", card_id)
          .eq("cycle_id", cycle_id)
          .maybeSingle();
        if (existing) return jsonResponse({ status: "waiting" }, 200, headers);
      } else {
        const writerId = resolveWriterId(
          user_id,
          isAnonymous,
          partner_tier,
          initiator_id,
          partner_id,
          tier_2_pseudo_id
        );
        if (writerId) {
          const { data: existing } = await supabase
            .from("user_card_state")
            .select("slider_completed_at")
            .eq("user_id", writerId)
            .eq("card_id", card_id)
            .eq("cycle_id", cycle_id)
            .maybeSingle();
          if (existing?.slider_completed_at) return jsonResponse({ status: "waiting" }, 200, headers);
        }
      }
    }

    // ── Phase C: reflection_skipped flag ──────────────────────────────────
    const reflectionSkipped =
      current_card_index >= PHASE_C_START && !checkin_reflection;

    // ── RULE 2: Tier-aware write ──────────────────────────────────────────
    const now = new Date().toISOString();

    if (isAnonymous) {
      // Tier 1: write to anonymous_slider_submission
      const { error: insertErr } = await supabase
        .from("anonymous_slider_submission")
        .insert({
          couple_id,
          card_id,
          cycle_id,
          slider_responses,
          checkin_reflection: checkin_reflection ?? null,
          submitted_at: now,
          link_token,
        });
      if (insertErr) throw insertErr;
    } else {
      // Determine writer user_id based on tier
      const writerId = resolveWriterId(
        user_id,
        isAnonymous,
        partner_tier,
        initiator_id,
        partner_id,
        tier_2_pseudo_id
      );

      if (!writerId) {
        return jsonResponse({ status: "error", message: "Cannot resolve writer" }, 400, headers);
      }

      const { error: upsertErr } = await supabase
        .from("user_card_state")
        .upsert({
          user_id: writerId,
          couple_id,
          card_id,
          cycle_id,
          slider_responses,
          slider_completed_at: now,
          checkin_reflection: checkin_reflection ?? null,
          reflection_skipped: reflectionSkipped,
        }, { onConflict: "user_id,card_id,cycle_id" });
      if (upsertErr) throw upsertErr;
    }

    // ── Check if BOTH partners have now submitted ─────────────────────────
    const bothDone = await checkBothPartnersSubmitted(
      supabase,
      couple,
      card_id,
      cycle_id,
      isAnonymous
    );

    if (bothDone) {
      // Advance current_touch to session_1 and enqueue N3 notification
      const { error: updateErr } = await supabase
        .from("couple_state")
        .update({ current_touch: "session_1", last_activity: now })
        .eq("couple_id", couple_id);
      if (updateErr) throw updateErr;

      // Enqueue N3 notification (both sliders done — ready for session)
      await enqueueNotification(supabase, couple_id, couple, "N3");

      return jsonResponse({ status: "ready" }, 200, headers);
    }

    return jsonResponse({ status: "waiting" }, 200, headers);
  } catch (err) {
    console.error("complete-slider-checkin error:", err);
    return jsonResponse({ status: "error", message: String(err) }, 500, headers);
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────

function resolveWriterId(
  userId: string | undefined,
  isAnonymous: boolean,
  partnerTier: string,
  initiatorId: string,
  partnerId: string | null,
  tier2PseudoId: string | null
): string | null {
  if (isAnonymous) return null; // anonymous writes don't use user_card_state
  if (userId === initiatorId) return initiatorId;
  if (partnerTier === "tier_2") return tier2PseudoId;
  if (partnerTier === "tier_3") return partnerId;
  return userId ?? null;
}

async function checkBothPartnersSubmitted(
  supabase: ReturnType<typeof createServiceClient>,
  couple: Record<string, unknown>,
  cardId: string,
  cycleId: number,
  callerIsAnonymous: boolean
): Promise<boolean> {
  const { initiator_id, partner_tier, partner_id, tier_2_pseudo_id } = couple as {
    initiator_id: string;
    partner_tier: string;
    partner_id: string | null;
    tier_2_pseudo_id: string | null;
  };

  // Check initiator submission
  const { data: initiatorRow } = await supabase
    .from("user_card_state")
    .select("slider_completed_at")
    .eq("user_id", initiator_id)
    .eq("card_id", cardId)
    .eq("cycle_id", cycleId)
    .maybeSingle();

  const initiatorDone = !!initiatorRow?.slider_completed_at;
  if (!initiatorDone) return false;

  // Check partner submission based on tier
  if (partner_tier === "tier_1") {
    const { data: anonRow } = await supabase
      .from("anonymous_slider_submission")
      .select("id")
      .eq("couple_id", couple.couple_id as string)
      .eq("card_id", cardId)
      .eq("cycle_id", cycleId)
      .maybeSingle();
    return !!anonRow;
  } else if (partner_tier === "tier_2") {
    if (!tier_2_pseudo_id) return false;
    const { data: partnerRow } = await supabase
      .from("user_card_state")
      .select("slider_completed_at")
      .eq("user_id", tier_2_pseudo_id)
      .eq("card_id", cardId)
      .eq("cycle_id", cycleId)
      .maybeSingle();
    return !!partnerRow?.slider_completed_at;
  } else if (partner_tier === "tier_3") {
    if (!partner_id) return false;
    const { data: partnerRow } = await supabase
      .from("user_card_state")
      .select("slider_completed_at")
      .eq("user_id", partner_id)
      .eq("card_id", cardId)
      .eq("cycle_id", cycleId)
      .maybeSingle();
    return !!partnerRow?.slider_completed_at;
  }

  return false;
}

async function enqueueNotification(
  supabase: ReturnType<typeof createServiceClient>,
  coupleId: string,
  couple: Record<string, unknown>,
  type: string
) {
  const { initiator_id, partner_id } = couple as {
    initiator_id: string;
    partner_id: string | null;
  };
  const recipients = [initiator_id, partner_id].filter(Boolean) as string[];
  for (const recipientUserId of recipients) {
    await supabase.from("notification_queue").insert({
      couple_id: coupleId,
      recipient_user_id: recipientUserId,
      notification_type: type,
      content: {},
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
