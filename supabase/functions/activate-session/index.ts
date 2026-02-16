import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    // 1. Authenticate caller
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

    // 2. Parse input
    const { proposal_id } = await req.json();
    if (!proposal_id || typeof proposal_id !== "string") {
      return json({ error: "missing_proposal_id" }, 400);
    }

    // 3. Service role client for privileged operations
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 4. Fetch proposal
    const { data: proposal, error: propErr } = await admin
      .from("topic_proposals")
      .select("*")
      .eq("id", proposal_id)
      .single();

    if (propErr || !proposal) {
      return json({ error: "proposal_not_found" }, 404);
    }

    // 5. Validate proposal state
    if (proposal.status !== "accepted") {
      return json({ error: "proposal_not_accepted" }, 409);
    }

    // Check expiry if set
    if (proposal.expires_at && new Date(proposal.expires_at) < new Date()) {
      return json({ error: "proposal_expired" }, 410);
    }

    // 6. Verify caller is a member of this couple space
    const { data: membership } = await admin
      .from("couple_members")
      .select("user_id")
      .eq("couple_space_id", proposal.couple_space_id);

    if (!membership || !membership.some((m: any) => m.user_id === userId)) {
      return json({ error: "not_a_member" }, 403);
    }

    // 7. Verify couple has 2 members
    if (membership.length < 2) {
      return json({ error: "partner_not_joined" }, 409);
    }

    // 8. Build session payload
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

    // 9. Upsert couple_progress with the new session
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

    // 10. Mark proposal as consumed
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
