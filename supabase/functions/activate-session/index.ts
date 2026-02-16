import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";
import { handleCors, getCorsHeaders } from "../_shared/cors.ts";

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
      .eq("couple_space_id", proposal.couple_space_id);

    if (!membership || !membership.some((m: any) => m.user_id === userId)) {
      return json({ error: "not_a_member" }, 403);
    }

    if (membership.length < 2) {
      return json({ error: "partner_not_joined" }, 409);
    }

    // Check for existing session — don't overwrite if it's for the same card
    const { data: existingProgress } = await admin
      .from("couple_progress")
      .select("current_session")
      .eq("couple_space_id", proposal.couple_space_id)
      .maybeSingle();

    const existingSession = existingProgress?.current_session as any;
    if (
      existingSession &&
      typeof existingSession === "object" &&
      existingSession.cardId === proposal.card_id
    ) {
      // Session already exists for this card — return it without overwriting
      return json({
        success: true,
        already_active: true,
        couple_space_id: proposal.couple_space_id,
        session: existingSession,
      });
    }

    const userCompletions: Record<string, number[]> = {};
    for (const m of membership) {
      userCompletions[m.user_id] = [];
    }

    const now = new Date().toISOString();
    const sessionPayload = {
      cardId: proposal.card_id,
      categoryId: proposal.category_id,
      currentStepIndex: 0,
      userCompletions,
      startedAt: now,
      lastActivityAt: now,
    };

    const { error: upsertErr } = await admin
      .from("couple_progress")
      .upsert(
        {
          couple_space_id: proposal.couple_space_id,
          current_session: sessionPayload,
          updated_by: userId,
        },
        { onConflict: "couple_space_id" }
      );

    if (upsertErr) {
      console.error("Upsert error:", upsertErr);
      return json({ error: "session_activation_failed" }, 500);
    }

    await admin
      .from("topic_proposals")
      .update({ updated_at: now })
      .eq("id", proposal_id);

    return json({
      success: true,
      couple_space_id: proposal.couple_space_id,
      session: sessionPayload,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return json({ error: "internal_error" }, 500);
  }
});
