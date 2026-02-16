import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const STEP_COUNT = 4;

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
    // 1. Authenticate
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
    const { card_id, step_index } = await req.json();
    if (typeof card_id !== "string" || typeof step_index !== "number") {
      return json({ error: "invalid_input" }, 400);
    }
    if (step_index < 0 || step_index >= STEP_COUNT) {
      return json({ error: "invalid_step_index" }, 400);
    }

    // 3. Service role
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 4. Get user's couple space
    const { data: spaceId, error: spaceErr } = await admin.rpc(
      "get_user_couple_space_id",
      { _user_id: userId }
    );
    if (spaceErr || !spaceId) {
      return json({ error: "no_couple_space" }, 403);
    }

    // 5. Get couple members
    const { data: members } = await admin
      .from("couple_members")
      .select("user_id")
      .eq("couple_space_id", spaceId);

    if (!members || !members.some((m: any) => m.user_id === userId)) {
      return json({ error: "not_a_member" }, 403);
    }

    const requiredCount = members.length >= 2 ? 2 : 1;

    // 6. Get current progress (with row lock via select-for-update pattern)
    const { data: progress, error: progressErr } = await admin
      .from("couple_progress")
      .select("*")
      .eq("couple_space_id", spaceId)
      .single();

    if (progressErr || !progress) {
      return json({ error: "no_progress_found" }, 404);
    }

    const session = progress.current_session as any;
    if (!session || typeof session !== "object") {
      return json({ error: "no_active_session" }, 409);
    }

    // 7. Validate session state
    if (session.cardId !== card_id) {
      return json({ error: "card_mismatch" }, 409);
    }

    if (step_index !== session.currentStepIndex) {
      return json({ error: "step_mismatch", expected: session.currentStepIndex }, 409);
    }

    // 8. Update userCompletions
    const userCompletions = session.userCompletions || {};
    const myCompleted: number[] = userCompletions[userId] || [];

    if (myCompleted.includes(step_index)) {
      // Already completed — idempotent success
      return json({ success: true, already_completed: true, session });
    }

    const updatedMyCompleted = [...myCompleted, step_index].sort();
    userCompletions[userId] = updatedMyCompleted;

    // 9. Check if all required users completed this step
    const completedByCount = Object.values(userCompletions).filter(
      (steps: any) => Array.isArray(steps) && steps.includes(step_index)
    ).length;
    const isMutuallyCompleted = completedByCount >= requiredCount;

    // 10. Advance step if mutually completed
    let newStepIndex = session.currentStepIndex;
    let sessionEnded = false;

    if (isMutuallyCompleted) {
      if (step_index === STEP_COUNT - 1) {
        // Card fully completed — end session
        sessionEnded = true;
      } else {
        newStepIndex = step_index + 1;
      }
    }

    const now = new Date().toISOString();

    // 11. Update journey_state with per-user completion
    const journeyState = (progress.journey_state as any) || {
      currentCategoryId: null,
      lastOpenedCardId: null,
      lastCompletedCardId: null,
      suggestedNextCardId: null,
      pausedAt: null,
      updatedAt: now,
      exploredCardIds: [],
      sessionProgress: {},
    };

    const sessionProgress = journeyState.sessionProgress || {};
    const cardProgress = sessionProgress[card_id] || { perUser: {} };
    cardProgress.perUser[userId] = { completedSteps: updatedMyCompleted };
    sessionProgress[card_id] = cardProgress;
    journeyState.sessionProgress = sessionProgress;
    journeyState.updatedAt = now;

    if (sessionEnded) {
      // Mark card as explored
      const exploredCardIds = journeyState.exploredCardIds || [];
      if (!exploredCardIds.includes(card_id)) {
        exploredCardIds.push(card_id);
      }
      journeyState.exploredCardIds = exploredCardIds;
      journeyState.lastCompletedCardId = card_id;
    }

    // 12. Build updated session (or null if ended)
    const updatedSession = sessionEnded
      ? null
      : {
          ...session,
          currentStepIndex: newStepIndex,
          userCompletions,
          lastActivityAt: now,
        };

    // 13. Write back
    const { error: updateErr } = await admin
      .from("couple_progress")
      .update({
        current_session: updatedSession,
        journey_state: journeyState,
        updated_by: userId,
        updated_at: now,
      })
      .eq("couple_space_id", spaceId);

    if (updateErr) {
      console.error("Update error:", updateErr);
      return json({ error: "update_failed" }, 500);
    }

    return json({
      success: true,
      session: updatedSession,
      journey_state: journeyState,
      step_advanced: isMutuallyCompleted,
      session_ended: sessionEnded,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return json({ error: "internal_error" }, 500);
  }
});
