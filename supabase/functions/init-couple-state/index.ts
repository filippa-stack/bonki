// ============================================================
// Still Us — Edge Function: init-couple-state
// ============================================================
// Creates the couple_state row when a user commits to starting
// the Still Us program (taps "Börja vecka 1" in ProductIntro).
//
// Input: (none — user_id derived from JWT)
// Returns: { couple_id, partner_link_token }
//
// Idempotent: if couple_state already exists for this initiator
// (not dissolved), returns the existing row.
//
// Auth: Bearer token required (authenticated users only).
// Writes via service-role to bypass RLS (no INSERT policy on couple_state).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase-client.ts";
import { createSessionStateForCard } from "../_shared/create-session-state.ts";
import { signLinkToken } from "../_shared/jwt-utils.ts";

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  const headers = getCorsHeaders(req);

  try {
    // ── Parse optional slider_anchors from body ─────────────────
    const body = await req.json().catch(() => ({}));
    const sliderAnchors = body?.slider_anchors ?? null;

    // ── Auth: verify JWT ───────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "unauthorized" }, 401, headers);
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return jsonResponse({ error: "unauthorized" }, 401, headers);
    }

    const userId = claimsData.claims.sub as string;

    // ── Service-role client (bypasses RLS) ─────────────────────
    const supabase = createServiceClient();

    // ── Idempotency: check for existing non-dissolved couple_state ─
    const { data: existing } = await supabase
      .from("couple_state")
      .select("couple_id, partner_link_token")
      .eq("initiator_id", userId)
      .is("dissolved_at", null)
      .maybeSingle();

    if (existing) {
      return jsonResponse(
        { couple_id: existing.couple_id, partner_link_token: existing.partner_link_token },
        200,
        headers
      );
    }

    // ── Create new couple_state ────────────────────────────────
    const coupleId = crypto.randomUUID();
    const firstCardId = "card_1"; // card_index 0

    // Generate partner link token (HS256 JWT, 7-day expiry)
    const partnerLinkToken = await signLinkToken({
      couple_id: coupleId,
      card_id: firstCardId,
      card_index: 0,
    });

    // INSERT couple_state with all defaults
    const { error: insertErr } = await supabase.from("couple_state").insert({
      couple_id: coupleId,
      initiator_id: userId,
      partner_link_token: partnerLinkToken,
      current_card_index: 0,
      current_touch: "slider",
      cycle_id: 1,
      phase: "program",
      partner_tier: "tier_1",
      purchase_status: "free_trial",
      current_slider_anchors: sliderAnchors,
    });

    if (insertErr) {
      console.error("couple_state insert error:", insertErr);
      // Could be a race condition — check again
      const { data: raceCheck } = await supabase
        .from("couple_state")
        .select("couple_id, partner_link_token")
        .eq("initiator_id", userId)
        .is("dissolved_at", null)
        .maybeSingle();

      if (raceCheck) {
        return jsonResponse(
          { couple_id: raceCheck.couple_id, partner_link_token: raceCheck.partner_link_token },
          200,
          headers
        );
      }

      return jsonResponse({ error: "couple_state_creation_failed" }, 500, headers);
    }

    // RULE 4: Create session_state for card_1 (CRITICAL)
    await createSessionStateForCard(supabase, coupleId, firstCardId, 1, "program");

    return jsonResponse(
      { couple_id: coupleId, partner_link_token: partnerLinkToken },
      201,
      headers
    );
  } catch (err) {
    console.error("init-couple-state error:", err);
    return jsonResponse({ error: "internal_error" }, 500, headers);
  }
});

function jsonResponse(body: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
