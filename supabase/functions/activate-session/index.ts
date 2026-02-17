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
    console.log("ACTIVATE_SESSION_HANDLER_START");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("ACTIVATE_SESSION_FAIL", { step: "auth_header", message: "unauthorized" });
      return json({ error: { step: "auth_header", message: "unauthorized", code: "AUTH_MISSING" } }, 401);
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Auth: get user id
    let userId: string;
    try {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: userErr } = await userClient.auth.getUser(token);
      if (userErr || !user) {
        console.error("ACTIVATE_SESSION_FAIL", { step: "auth_get_user", message: userErr?.message, code: userErr?.code });
        return json({ error: { step: "auth_get_user", message: "unauthorized", code: "AUTH_USER", details: userErr?.message } }, 401);
      }
      userId = user.id;
    } catch (authErr: any) {
      console.error("ACTIVATE_SESSION_FAIL", { step: "auth_exception", message: String(authErr?.message ?? authErr) });
      return json({ error: { step: "auth_exception", message: String(authErr?.message ?? authErr), code: "AUTH_EXCEPTION" } }, 401);
    }

    // Parse body
    let bodyJson: any;
    try { bodyJson = await req.json(); } catch {
      console.error("ACTIVATE_SESSION_FAIL", { step: "body_parse", message: "invalid_json_body" });
      return json({ error: { step: "body_parse", message: "invalid_json_body", code: "BODY_PARSE" } }, 400);
    }
    const { proposal_id } = bodyJson;
    if (!proposal_id || typeof proposal_id !== "string") {
      console.error("ACTIVATE_SESSION_FAIL", { step: "validation", message: "missing_proposal_id" });
      return json({ error: { step: "validation", message: "missing_proposal_id", code: "VALIDATION" } }, 400);
    }

    console.log("ACTIVATE_SESSION_INPUTS", { proposal_id, userId });

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch proposal
    const { data: proposal, error: propErr } = await admin
      .from("topic_proposals")
      .select("*")
      .eq("id", proposal_id)
      .single();

    if (propErr || !proposal) {
      console.error("ACTIVATE_SESSION_FAIL", { step: "proposal_fetch", message: propErr?.message, code: propErr?.code, details: propErr?.details, hint: propErr?.hint });
      return json({ error: { step: "proposal_fetch", message: propErr?.message || "proposal_not_found", code: propErr?.code || "NOT_FOUND", details: propErr?.details, hint: propErr?.hint } }, 404);
    }

    console.log("ACTIVATE_SESSION_PROPOSAL", {
      couple_space_id: proposal.couple_space_id,
      card_id: proposal.card_id,
      category_id: proposal.category_id,
      status: proposal.status,
      step_count: STEP_COUNT,
      userId,
    });

    if (proposal.status !== "accepted") {
      console.error("ACTIVATE_SESSION_FAIL", { step: "proposal_status", message: "proposal_not_accepted", details: `status=${proposal.status}` });
      return json({ error: { step: "proposal_status", message: "proposal_not_accepted", code: "STATUS_CONFLICT", details: `status=${proposal.status}` } }, 409);
    }

    if (proposal.expires_at && new Date(proposal.expires_at) < new Date()) {
      console.error("ACTIVATE_SESSION_FAIL", { step: "proposal_expiry", message: "proposal_expired" });
      return json({ error: { step: "proposal_expiry", message: "proposal_expired", code: "EXPIRED" } }, 410);
    }

    // Membership check
    const { data: membership, error: memErr } = await admin
      .from("couple_members")
      .select("user_id")
      .eq("couple_space_id", proposal.couple_space_id)
      .is("left_at", null)
      .eq("status", "active");

    if (memErr) {
      console.error("ACTIVATE_SESSION_FAIL", { step: "membership_query", message: memErr.message, code: memErr.code, details: memErr.details, hint: memErr.hint });
      return json({ error: { step: "membership_query", message: memErr.message, code: memErr.code, details: memErr.details, hint: memErr.hint } }, 500);
    }

    console.log("ACTIVATE_SESSION_MEMBERS", { count: membership?.length, memberIds: membership?.map((m: any) => m.user_id) });

    if (!membership || !membership.some((m: any) => m.user_id === userId)) {
      console.error("ACTIVATE_SESSION_FAIL", { step: "membership_check", message: "not_a_member", details: `userId=${userId}` });
      return json({ error: { step: "membership_check", message: "not_a_member", code: "FORBIDDEN", details: `userId=${userId}` } }, 403);
    }

    if (membership.length < 2) {
      console.error("ACTIVATE_SESSION_FAIL", { step: "member_count", message: "partner_not_joined", details: `active_members=${membership.length}` });
      return json({ error: { step: "member_count", message: "partner_not_joined", code: "MEMBER_COUNT", details: `active_members=${membership.length}` } }, 409);
    }

    // Existing active session check
    const { data: existingSession, error: existErr } = await admin
      .from("couple_sessions")
      .select("id, card_id, category_id")
      .eq("couple_space_id", proposal.couple_space_id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (existErr) {
      console.error("ACTIVATE_SESSION_FAIL", { step: "existing_session_query", message: existErr.message, code: existErr.code, details: existErr.details, hint: existErr.hint });
      return json({ error: { step: "existing_session_query", message: existErr.message, code: existErr.code, details: existErr.details, hint: existErr.hint } }, 500);
    }

    if (existingSession && existingSession.card_id === proposal.card_id) {
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

    // RPC call
    console.log("CALLING_RPC activate_couple_session", {
      couple_space_id: proposal.couple_space_id,
      category_id: proposal.category_id,
      card_id: proposal.card_id,
      step_count: STEP_COUNT,
    });

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
      console.error("ACTIVATE_SESSION_FAIL", { step: "rpc_activate_couple_session", message: rpcErr.message, code: rpcErr.code, details: rpcErr.details, hint: rpcErr.hint });
      return json({ error: { step: "rpc_activate_couple_session", message: rpcErr.message, code: rpcErr.code, details: rpcErr.details, hint: rpcErr.hint } }, 400);
    }

    console.log("RPC_SUCCESS", { sessionId });

    const now = new Date().toISOString();

    const { error: updateErr } = await admin
      .from("topic_proposals")
      .update({ updated_at: now })
      .eq("id", proposal_id);

    if (updateErr) {
      console.error("PROPOSAL_UPDATE_FAIL", updateErr);
      // Non-fatal, continue
    }

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
    console.error("ACTIVATE_SESSION_ERROR", err);
    return json({ error: { message: String(err?.message ?? err), stack: String(err?.stack ?? ""), cause: String(err?.cause ?? "") } }, 500);
  }
});
