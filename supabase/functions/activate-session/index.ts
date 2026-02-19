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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: { message: "unauthorized", code: "AUTH_MISSING" } }, 401);
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    let userId: string;
    try {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: userErr } = await userClient.auth.getUser(token);
      if (userErr || !user) {
        return json({ error: { message: "unauthorized", code: "AUTH_USER" } }, 401);
      }
      userId = user.id;
    } catch (authErr: any) {
      return json({ error: { message: String(authErr?.message ?? authErr), code: "AUTH_EXCEPTION" } }, 401);
    }

    // Parse body
    let bodyJson: any;
    try { bodyJson = await req.json(); } catch {
      return json({ error: { message: "invalid_json_body", code: "BODY_PARSE" } }, 400);
    }

    const { card_id, category_id, couple_space_id } = bodyJson;
    if (!card_id || !category_id || !couple_space_id) {
      return json({ error: { message: "missing_required_fields", code: "VALIDATION" } }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Membership check — caller must be an active member of the space
    const { data: membership, error: memErr } = await admin
      .from("couple_members")
      .select("user_id")
      .eq("couple_space_id", couple_space_id)
      .is("left_at", null)
      .eq("status", "active");

    if (memErr) {
      return json({ error: { message: memErr.message, code: memErr.code } }, 500);
    }

    if (!membership || !membership.some((m: any) => m.user_id === userId)) {
      return json({ error: { message: "not_a_member", code: "FORBIDDEN" } }, 403);
    }

    // Return existing active session if already running for this card
    const { data: existingSession } = await admin
      .from("couple_sessions")
      .select("id, card_id, category_id")
      .eq("couple_space_id", couple_space_id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (existingSession && existingSession.card_id === card_id) {
      return json({
        success: true,
        already_active: true,
        couple_space_id,
        session: {
          cardId: existingSession.card_id,
          categoryId: existingSession.category_id,
          currentStepIndex: 0,
        },
      });
    }

    // Activate session via RPC — no member count gate (single-user model)
    const { data: sessionId, error: rpcErr } = await admin.rpc(
      "activate_couple_session",
      {
        p_couple_space_id: couple_space_id,
        p_category_id: category_id,
        p_card_id: card_id,
        p_step_count: STEP_COUNT,
      }
    );

    if (rpcErr) {
      return json({ error: { message: rpcErr.message, code: rpcErr.code } }, 400);
    }

    const now = new Date().toISOString();
    return json({
      success: true,
      couple_space_id,
      session: {
        cardId: card_id,
        categoryId: category_id,
        currentStepIndex: 0,
        startedAt: now,
        lastActivityAt: now,
      },
    });
  } catch (err: any) {
    console.error("ACTIVATE_SESSION_ERROR", err);
    return json({ error: { message: String(err?.message ?? err) } }, 500);
  }
});
