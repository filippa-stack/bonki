// SESSION MODEL LOCK:
// Do NOT use couple_progress.current_session.
// The JSON session model is deprecated.
// All session state must come from normalized tables.

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
    console.log("APPROVE_EDGE_START");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: { message: "unauthorized", code: "AUTH_MISSING" } }, 401);
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
      return json({ error: { message: "unauthorized", code: "AUTH_CLAIMS" } }, 401);
    }
    const userId = claimsData.claims.sub as string;

    let bodyJson: any;
    try { bodyJson = await req.json(); } catch {
      return json({ error: { message: "invalid_json_body", code: "BODY_PARSE" } }, 400);
    }
    const { proposal_id } = bodyJson;
    if (!proposal_id || typeof proposal_id !== "string") {
      return json({ error: { message: "missing_proposal_id", code: "VALIDATION" } }, 400);
    }

    console.log("APPROVE_EDGE_PARAMS", { proposal_id, userId });

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: proposal, error: propErr } = await admin
      .from("topic_proposals")
      .select("*")
      .eq("id", proposal_id)
      .single();

    if (propErr || !proposal) {
      console.error("PROPOSAL_FETCH_FAIL", propErr);
      return json({ error: { message: "proposal_not_found", code: "NOT_FOUND", details: propErr?.message } }, 404);
    }

    console.log("APPROVE_EDGE_PROPOSAL", { couple_space_id: proposal.couple_space_id, status: proposal.status, card_id: proposal.card_id });

    if (proposal.status !== "accepted") {
      return json({ error: { message: "proposal_not_accepted", code: "STATUS_CONFLICT", details: `status=${proposal.status}` } }, 409);
    }

    if (proposal.expires_at && new Date(proposal.expires_at) < new Date()) {
      return json({ error: { message: "proposal_expired", code: "EXPIRED" } }, 410);
    }

    const { data: membership, error: memErr } = await admin
      .from("couple_members")
      .select("user_id")
      .eq("couple_space_id", proposal.couple_space_id)
      .is("left_at", null)
      .eq("status", "active");

    console.log("APPROVE_EDGE_MEMBERS", { count: membership?.length, memberIds: membership?.map((m: any) => m.user_id), memErr });

    if (!membership || !membership.some((m: any) => m.user_id === userId)) {
      return json({ error: { message: "not_a_member", code: "FORBIDDEN", details: `userId=${userId}` } }, 403);
    }

    if (membership.length < 2) {
      return json({ error: { message: "partner_not_joined", code: "MEMBER_COUNT", details: `active_members=${membership.length}` } }, 409);
    }

    // Check for existing active session in couple_sessions
    const { data: existingSession } = await admin
      .from("couple_sessions")
      .select("id, card_id, category_id")
      .eq("couple_space_id", proposal.couple_space_id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (existingSession && existingSession.card_id === proposal.card_id) {
      // Session already exists for this card — return it
      return json({
        success: true,
        already_active: true,
        couple_space_id: proposal.couple_space_id,
        session: {
          cardId: existingSession.card_id,
          categoryId: existingSession.category_id,
          currentStepIndex: 0,
        },
      });
    }

    // Create normalized session via RPC
    console.log("CALLING_RPC activate_couple_session", { couple_space_id: proposal.couple_space_id, category_id: proposal.category_id, card_id: proposal.card_id, step_count: STEP_COUNT });

    const { data: sessionId, error: rpcErr } = await admin.rpc(
      "activate_couple_session",
      {
        p_couple_space_id: proposal.couple_space_id,
        p_category_id: proposal.category_id,
        p_card_id: proposal.card_id,
        p_step_count: STEP_COUNT,
      }
    );

    if (rpcErr) {
      console.error("RPC_FAIL activate_couple_session", { message: rpcErr.message, code: rpcErr.code, details: rpcErr.details, hint: rpcErr.hint });
      return json({ error: { message: rpcErr.message || "session_activation_failed", code: rpcErr.code || "RPC_ERROR", details: rpcErr.details || rpcErr.hint } }, 500);
    }

    console.log("RPC_SUCCESS", { sessionId });

    const now = new Date().toISOString();

    await admin
      .from("topic_proposals")
      .update({ updated_at: now })
      .eq("id", proposal_id);

    return json({
      success: true,
      couple_space_id: proposal.couple_space_id,
      session: {
        cardId: proposal.card_id,
        categoryId: proposal.category_id,
        currentStepIndex: 0,
        startedAt: now,
        lastActivityAt: now,
      },
    });
  } catch (err: any) {
    console.error("APPROVE_EDGE_UNCAUGHT", err);
    return json({ error: { message: err?.message || "internal_error", code: "UNCAUGHT" } }, 500);
  }
});
