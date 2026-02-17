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

    const { proposal_id } = await req.json();
    if (!proposal_id || typeof proposal_id !== "string") {
      return json({ error: "missing_proposal_id" }, 400);
    }

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
      return json({ error: "proposal_not_found" }, 404);
    }

    if (proposal.status !== "accepted") {
      return json({ error: "proposal_not_accepted" }, 409);
    }

    if (proposal.expires_at && new Date(proposal.expires_at) < new Date()) {
      return json({ error: "proposal_expired" }, 410);
    }

    const { data: membership } = await admin
      .from("couple_members")
      .select("user_id")
      .eq("couple_space_id", proposal.couple_space_id)
      .is("left_at", null)
      .eq("status", "active");

    if (!membership || !membership.some((m: any) => m.user_id === userId)) {
      return json({ error: "not_a_member" }, 403);
    }

    if (membership.length < 2) {
      return json({ error: "partner_not_joined" }, 409);
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
      console.error("activate_couple_session RPC error:", rpcErr);
      return json({ error: "session_activation_failed" }, 500);
    }

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
  } catch (err) {
    console.error("Unexpected error:", err);
    return json({ error: "internal_error" }, 500);
  }
});
