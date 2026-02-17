import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";
import { handleCors, getCorsHeaders } from "../_shared/cors.ts";

const STEP_COUNT = 4;

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const corsHeaders = getCorsHeaders(req);

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "unauthorized" }, 401);
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } =
      await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return json({ error: "unauthorized" }, 401);
    }
    const userId = claimsData.claims.sub as string;

    const { card_id, step_index } = await req.json();
    if (typeof card_id !== "string" || typeof step_index !== "number") {
      return json({ error: "invalid_input" }, 400);
    }
    if (step_index < 0 || step_index >= STEP_COUNT) {
      return json({ error: "invalid_step_index" }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: spaceId, error: spaceErr } = await admin.rpc(
      "get_user_couple_space_id",
      { _user_id: userId }
    );
    if (spaceErr || !spaceId) {
      return json({ error: "no_couple_space" }, 403);
    }

    // Find active session in couple_sessions
    const { data: activeSession, error: sessionErr } = await admin
      .from("couple_sessions")
      .select("id, card_id")
      .eq("couple_space_id", spaceId)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (sessionErr || !activeSession) {
      return json({ error: "no_active_session" }, 409);
    }

    if (activeSession.card_id !== card_id) {
      return json({ error: "card_mismatch" }, 409);
    }

    // Complete the step via RPC
    const { data: result, error: rpcErr } = await admin.rpc(
      "complete_couple_session_step",
      {
        p_session_id: activeSession.id,
        p_step_index: step_index,
      }
    );

    if (rpcErr) {
      console.error("complete_couple_session_step error:", rpcErr);
      return json({ error: "completion_failed" }, 500);
    }

    const stepResult = result as any;

    // Update journey_state in couple_progress for exploredCardIds tracking
    if (stepResult?.is_session_complete) {
      const now = new Date().toISOString();
      const { data: progress } = await admin
        .from("couple_progress")
        .select("journey_state")
        .eq("couple_space_id", spaceId)
        .single();

      const journeyState = (progress?.journey_state as any) || {
        currentCategoryId: null,
        lastOpenedCardId: null,
        lastCompletedCardId: null,
        suggestedNextCardId: null,
        pausedAt: null,
        updatedAt: now,
        exploredCardIds: [],
        sessionProgress: {},
      };

      const exploredCardIds = journeyState.exploredCardIds || [];
      if (!exploredCardIds.includes(card_id)) {
        exploredCardIds.push(card_id);
      }
      journeyState.exploredCardIds = exploredCardIds;
      journeyState.lastCompletedCardId = card_id;
      journeyState.updatedAt = now;

      await admin
        .from("couple_progress")
        .update({
          journey_state: journeyState,
          updated_by: userId,
          updated_at: now,
        })
        .eq("couple_space_id", spaceId);
    }

    return json({
      success: true,
      step_advanced: stepResult?.is_step_complete ?? false,
      session_ended: stepResult?.is_session_complete ?? false,
      is_waiting: stepResult?.is_waiting ?? false,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return json({ error: "internal_error" }, 500);
  }
});
