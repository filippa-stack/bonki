// ============================================================
// Still Us — Edge Function: compute-journey-insights
// ============================================================
// Input: { couple_id, cycle_id }
// Returns: { max_delta_card, min_delta_card, total_reflections, has_sufficient_data, from_cache }
//
// Read-only (except for cache write). No dissolved_at check needed.
// Cache TTL: 24 hours. Cache is invalidated by advance_card and skip_card.

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase-client.ts";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MIN_CARDS_FOR_SUFFICIENT_DATA = 12;

Deno.serve(async (req: Request) => {

  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  const headers = getCorsHeaders(req);

  try {
    const { couple_id, cycle_id } = await req.json();

    if (!couple_id || cycle_id === undefined) {
      return jsonResponse({ status: "error", message: "Missing required fields" }, 400, headers);
    }

    const supabase = createServiceClient();

    // Check cache first
    const { data: cached } = await supabase
      .from("journey_insights_cache")
      .select("*")
      .eq("couple_id", couple_id)
      .eq("cycle_id", cycle_id)
      .single();

    if (cached) {
      const age = Date.now() - new Date(cached.computed_at).getTime();
      if (age < CACHE_TTL_MS) {
        return jsonResponse(
          {
            ...cached,
            from_cache: true,
          },
          200,
          headers
        );
      }
    }

    // Fetch couple to know partner details
    const { data: couple, error: coupleErr } = await supabase
      .from("couple_state")
      .select("initiator_id, partner_id, partner_tier, tier_2_pseudo_id")
      .eq("couple_id", couple_id)
      .single();

    if (coupleErr || !couple) {
      return jsonResponse({ status: "error", message: "Couple not found" }, 404, headers);
    }

    const { initiator_id, partner_id, partner_tier, tier_2_pseudo_id } = couple as {
      initiator_id: string;
      partner_id: string | null;
      partner_tier: string;
      tier_2_pseudo_id: string | null;
    };

    // Resolve partner's effective user_id for user_card_state queries
    const partnerUserId =
      partner_tier === "tier_2"
        ? tier_2_pseudo_id
        : partner_tier === "tier_3"
        ? partner_id
        : null; // Tier 1 uses anonymous_slider_submission

    // ── total_reflections ─────────────────────────────────────────────────
    // Count non-null text from user_card_state + anonymous tables
    const { data: initiatorRows } = await supabase
      .from("user_card_state")
      .select("checkin_reflection, session_1_takeaway, takeaway")
      .eq("user_id", initiator_id)
      .eq("couple_id", couple_id)
      .eq("cycle_id", cycle_id);

    let totalReflections = 0;
    for (const row of initiatorRows ?? []) {
      if (row.checkin_reflection) totalReflections++;
      if (row.session_1_takeaway) totalReflections++;
      if (row.takeaway) totalReflections++;
    }

    if (partnerUserId) {
      const { data: partnerRows } = await supabase
        .from("user_card_state")
        .select("checkin_reflection, session_1_takeaway, takeaway")
        .eq("user_id", partnerUserId)
        .eq("couple_id", couple_id)
        .eq("cycle_id", cycle_id);

      for (const row of partnerRows ?? []) {
        if (row.checkin_reflection) totalReflections++;
        if (row.session_1_takeaway) totalReflections++;
        if (row.takeaway) totalReflections++;
      }
    } else {
      // Tier 1: anonymous tables
      const { data: anonSliders } = await supabase
        .from("anonymous_slider_submission")
        .select("checkin_reflection")
        .eq("couple_id", couple_id)
        .eq("cycle_id", cycle_id);

      for (const row of anonSliders ?? []) {
        if (row.checkin_reflection) totalReflections++;
      }

      const { data: anonTakeaways } = await supabase
        .from("anonymous_session_takeaway")
        .select("session_1_takeaway, takeaway")
        .eq("couple_id", couple_id)
        .eq("cycle_id", cycle_id);

      for (const row of anonTakeaways ?? []) {
        if (row.session_1_takeaway) totalReflections++;
        if (row.takeaway) totalReflections++;
      }
    }

    // ── has_sufficient_data ──────────────────────────────────────────────
    // Count cards where BOTH partners have slider data
    const { data: initiatorSliders } = await supabase
      .from("user_card_state")
      .select("card_id, slider_responses")
      .eq("user_id", initiator_id)
      .eq("couple_id", couple_id)
      .eq("cycle_id", cycle_id)
      .not("slider_responses", "is", null);

    const initiatorCardIds = new Set(
      (initiatorSliders ?? []).map((r: { card_id: string }) => r.card_id)
    );

    let dualPartnerCardCount = 0;

    if (partnerUserId) {
      const { data: partnerSliders } = await supabase
        .from("user_card_state")
        .select("card_id")
        .eq("user_id", partnerUserId)
        .eq("couple_id", couple_id)
        .eq("cycle_id", cycle_id)
        .not("slider_responses", "is", null);

      const partnerCardIds = new Set(
        (partnerSliders ?? []).map((r: { card_id: string }) => r.card_id)
      );

      for (const cardId of initiatorCardIds) {
        if (partnerCardIds.has(cardId)) dualPartnerCardCount++;
      }
    } else {
      // Tier 1
      const { data: anonSliders } = await supabase
        .from("anonymous_slider_submission")
        .select("card_id")
        .eq("couple_id", couple_id)
        .eq("cycle_id", cycle_id);

      const anonCardIds = new Set(
        (anonSliders ?? []).map((r: { card_id: string }) => r.card_id)
      );

      for (const cardId of initiatorCardIds) {
        if (anonCardIds.has(cardId)) dualPartnerCardCount++;
      }
    }

    const hasSufficientData = dualPartnerCardCount >= MIN_CARDS_FOR_SUFFICIENT_DATA;

    // ── max_delta_card / min_delta_card ──────────────────────────────────
    // For each card with dual-partner sliders, compute average absolute delta
    let maxDeltaCard: Record<string, unknown> | null = null;
    let minDeltaCard: Record<string, unknown> | null = null;

    if (hasSufficientData) {
      const deltas = await computeSliderDeltas(
        supabase,
        couple_id,
        cycle_id,
        initiator_id,
        partnerUserId,
        partner_tier
      );

      if (deltas.length > 0) {
        deltas.sort((a, b) => b.avgDelta - a.avgDelta);
        maxDeltaCard = { card_id: deltas[0].cardId, avg_delta: deltas[0].avgDelta };
        minDeltaCard = {
          card_id: deltas[deltas.length - 1].cardId,
          avg_delta: deltas[deltas.length - 1].avgDelta,
        };
      }
    }

    // Write to cache
    const result = {
      couple_id,
      cycle_id,
      max_delta_card: maxDeltaCard,
      min_delta_card: minDeltaCard,
      total_reflections: totalReflections,
      has_sufficient_data: hasSufficientData,
      computed_at: new Date().toISOString(),
    };

    await supabase
      .from("journey_insights_cache")
      .upsert(result, { onConflict: "couple_id,cycle_id" });

    return jsonResponse({ ...result, from_cache: false }, 200, headers);
  } catch (err) {
    console.error("compute-journey-insights error:", err);
    return jsonResponse({ status: "error", message: String(err) }, 500, headers);
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────

async function computeSliderDeltas(
  supabase: ReturnType<typeof createServiceClient>,
  coupleId: string,
  cycleId: number,
  initiatorId: string,
  partnerUserId: string | null,
  partnerTier: string
): Promise<{ cardId: string; avgDelta: number }[]> {
  const { data: initiatorRows } = await supabase
    .from("user_card_state")
    .select("card_id, slider_responses")
    .eq("user_id", initiatorId)
    .eq("couple_id", coupleId)
    .eq("cycle_id", cycleId)
    .not("slider_responses", "is", null);

  const initiatorByCard = new Map<string, Array<{ slider_id: string; position: number }>>();
  for (const row of initiatorRows ?? []) {
    initiatorByCard.set(row.card_id, row.slider_responses);
  }

  const partnerByCard = new Map<string, Array<{ slider_id: string; position: number }>>();

  if (partnerUserId) {
    const { data: partnerRows } = await supabase
      .from("user_card_state")
      .select("card_id, slider_responses")
      .eq("user_id", partnerUserId)
      .eq("couple_id", coupleId)
      .eq("cycle_id", cycleId)
      .not("slider_responses", "is", null);

    for (const row of partnerRows ?? []) {
      partnerByCard.set(row.card_id, row.slider_responses);
    }
  } else if (partnerTier === "tier_1") {
    const { data: anonRows } = await supabase
      .from("anonymous_slider_submission")
      .select("card_id, slider_responses")
      .eq("couple_id", coupleId)
      .eq("cycle_id", cycleId);

    for (const row of anonRows ?? []) {
      partnerByCard.set(row.card_id, row.slider_responses);
    }
  }

  const deltas: { cardId: string; avgDelta: number }[] = [];

  for (const [cardId, initiatorSliders] of initiatorByCard) {
    const partnerSliders = partnerByCard.get(cardId);
    if (!partnerSliders) continue;

    const partnerMap = new Map(
      partnerSliders.map((s) => [s.slider_id, s.position])
    );

    let totalDelta = 0;
    let count = 0;
    for (const s of initiatorSliders) {
      const partnerPos = partnerMap.get(s.slider_id);
      if (partnerPos !== undefined) {
        totalDelta += Math.abs(s.position - partnerPos);
        count++;
      }
    }

    if (count > 0) {
      deltas.push({ cardId, avgDelta: totalDelta / count });
    }
  }

  return deltas;
}

function jsonResponse(body: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
