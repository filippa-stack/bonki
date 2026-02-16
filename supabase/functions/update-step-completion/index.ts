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

    const { data: members } = await admin
      .from("couple_members")
      .select("user_id")
      .eq("couple_space_id", spaceId);

    if (!members || !members.some((m: any) => m.user_id === userId)) {
      return json({ error: "not_a_member" }, 403);
    }

    const requiredCount = members.length >= 2 ? 2 : 1;

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

    if (session.cardId !== card_id) {
      return json({ error: "card_mismatch" }, 409);
    }

    if (step_index !== session.currentStepIndex) {
      return json({ error: "step_mismatch", expected: session.currentStepIndex }, 409);
    }

    const userCompletions = session.userCompletions || {};
    const myCompleted: number[] = userCompletions[userId] || [];

    if (myCompleted.includes(step_index)) {
      return json({ success: true, already_completed: true, session });
    }

    const updatedMyCompleted = [...myCompleted, step_index].sort();
    userCompletions[userId] = updatedMyCompleted;

    const completedByCount = Object.values(userCompletions).filter(
      (steps: any) => Array.isArray(steps) && steps.includes(step_index)
    ).length;
    const isMutuallyCompleted = completedByCount >= requiredCount;

    let newStepIndex = session.currentStepIndex;
    let sessionEnded = false;

    if (isMutuallyCompleted) {
      if (step_index === STEP_COUNT - 1) {
        sessionEnded = true;
      } else {
        newStepIndex = step_index + 1;
      }
    }

    const now = new Date().toISOString();

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
      const exploredCardIds = journeyState.exploredCardIds || [];
      if (!exploredCardIds.includes(card_id)) {
        exploredCardIds.push(card_id);
      }
      journeyState.exploredCardIds = exploredCardIds;
      journeyState.lastCompletedCardId = card_id;
    }

    const updatedSession = sessionEnded
      ? null
      : {
          ...session,
          currentStepIndex: newStepIndex,
          userCompletions,
          lastActivityAt: now,
        };

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
