// ============================================================
// Still Us — Edge Function: skip-card
// ============================================================
// Input: { couple_id, card_id, skip_type }
//   skip_type: 'user_skipped' | 'auto_advanced'
// Returns: { status: 'skipped' | 'ceremony' | 'dissolved', new_card_index? }
//
// RULE 1: Sequential writes within single invocation
// RULE 3: Card 22 (index 21) is terminal — NEVER increment past it
// RULE 4: createSessionStateForCard called for every new card
// RULE 6: dissolved_at guard
//
// Notification types:
// - N1: new card ready (both terminal=false cases)
// - N2: auto_advanced — "Ni har gått vidare till Vecka [N+1]."
// - Terminal auto_advanced: "Ni har avslutat programmet. Er ceremoni väntar."

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase-client.ts";
import { createSessionStateForCard } from "../_shared/create-session-state.ts";
import { signLinkToken } from "../_shared/jwt-utils.ts";

const TERMINAL_CARD_INDEX = 21;

/** 1-indexed card_id convention: card_index 0 → "card_1", etc. */
function cardIdFromIndex(index: number): string {
  return `card_${index + 1}`;
}

Deno.serve(async (req: Request) => {

  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  const headers = getCorsHeaders(req);

  try {
    const { couple_id, card_id, skip_type } = await req.json();

    if (!couple_id || !card_id || !skip_type) {
      return jsonResponse({ status: "error", message: "Missing required fields" }, 400, headers);
    }

    if (!["user_skipped", "auto_advanced"].includes(skip_type)) {
      return jsonResponse({ status: "error", message: "Invalid skip_type" }, 400, headers);
    }

    const supabase = createServiceClient();

    // RULE 6: dissolved_at guard
    const { data: couple, error: coupleErr } = await supabase
      .from("couple_state")
      .select("*")
      .eq("couple_id", couple_id)
      .single();

    if (coupleErr || !couple) {
      return jsonResponse({ status: "error", message: "Couple not found" }, 404, headers);
    }
    if (couple.dissolved_at) {
      return jsonResponse({ status: "dissolved" }, 200, headers);
    }

    const { current_card_index, cycle_id, initiator_id, partner_id } = couple as {
      current_card_index: number;
      cycle_id: number;
      initiator_id: string;
      partner_id: string | null;
    };

    const now = new Date().toISOString();

    // Step 1–2: Mark current card's session_state as skipped
    await supabase
      .from("session_state")
      .update({
        skip_status: skip_type,
        completed_at: now,
      })
      .eq("couple_id", couple_id)
      .eq("card_id", card_id)
      .eq("cycle_id", cycle_id);

    // RULE 3: Terminal card guard
    if (current_card_index >= TERMINAL_CARD_INDEX) {
      await supabase.from("couple_state").update({
        current_touch: "complete",
        phase: "ceremony",
        last_activity: now,
      }).eq("couple_id", couple_id);

      // Invalidate cache
      await supabase
        .from("journey_insights_cache")
        .delete()
        .eq("couple_id", couple_id)
        .eq("cycle_id", cycle_id);

      // No N1. No session_state INSERT.
      if (skip_type === "auto_advanced") {
        await enqueueNotification(supabase, couple_id, initiator_id, partner_id, "N2", {
          message: "Ni har avslutat programmet. Er ceremoni väntar.",
          terminal: true,
        });
      }

      return jsonResponse({ status: "ceremony" }, 200, headers);
    }

    // Non-terminal: advance to next card
    const newCardIndex = current_card_index + 1;
    const newCardId = cardIdFromIndex(newCardIndex);

    // Regenerate partner_link_token for new card
    const newLinkToken = await signLinkToken({
      couple_id,
      card_id: newCardId,
      card_index: newCardIndex,
    });

    await supabase.from("couple_state").update({
      current_card_index: newCardIndex,
      current_touch: "slider",
      last_activity: now,
      partner_link_token: newLinkToken,
    }).eq("couple_id", couple_id);

    // RULE 4: Create session_state for new card (CRITICAL invariant)
    await createSessionStateForCard(supabase, couple_id, newCardId, cycle_id, "program");

    // Queue N1 notification (new card ready)
    await enqueueNotification(supabase, couple_id, initiator_id, partner_id, "N1", {
      card_id: newCardId,
      card_index: newCardIndex,
    });

    // Invalidate cache
    await supabase
      .from("journey_insights_cache")
      .delete()
      .eq("couple_id", couple_id)
      .eq("cycle_id", cycle_id);

    // N2 for auto_advanced: "Ni har gått vidare till Vecka [N+1]."
    if (skip_type === "auto_advanced") {
      await enqueueNotification(supabase, couple_id, initiator_id, partner_id, "N2", {
        message: `Ni har gått vidare till Vecka ${newCardIndex + 1}.`,
        card_id: newCardId,
        card_index: newCardIndex,
      });
    }

    return jsonResponse({ status: "skipped", new_card_index: newCardIndex, partner_link_token: newLinkToken }, 200, headers);
  } catch (err) {
    console.error("skip-card error:", err);
    return jsonResponse({ status: "error", message: String(err) }, 500, headers);
  }
});

async function enqueueNotification(
  supabase: ReturnType<typeof createServiceClient>,
  coupleId: string,
  initiatorId: string,
  partnerId: string | null,
  type: string,
  content: Record<string, unknown> = {}
) {
  const recipients = [initiatorId, partnerId].filter(Boolean) as string[];
  for (const recipientUserId of recipients) {
    await supabase.from("notification_queue").insert({
      couple_id: coupleId,
      recipient_user_id: recipientUserId,
      notification_type: type,
      content,
      scheduled_at: new Date().toISOString(),
    });
  }
}

function jsonResponse(body: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}