// ============================================================
// Still Us — Shared: createSessionStateForCard
// ============================================================
// Called by advance_card, skip_card, restart_program,
// couple initialization, advance_tillbaka_cards (cron),
// and migrate RPCs. Uses INSERT ... ON CONFLICT DO NOTHING
// for idempotent retries.
//
// RULE 4: Every new card must have a session_state row.
// All six code paths that create new cards MUST call this.

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function createSessionStateForCard(
  supabase: SupabaseClient,
  coupleId: string,
  cardId: string,
  cycleId: number,
  sessionType: "program" | "tillbaka"
): Promise<void> {
  const defaults =
    sessionType === "program"
      ? { current_step: "oppna", session_2_completed: false }
      : { current_step: "tillbaka_q1", session_2_completed: null };

  const { error } = await supabase.rpc("insert_session_state_idempotent", {
    p_couple_id: coupleId,
    p_card_id: cardId,
    p_cycle_id: cycleId,
    p_session_type: sessionType,
    p_current_step: defaults.current_step,
    p_session_2_completed: defaults.session_2_completed,
  });

  if (error) {
    throw new Error(`createSessionStateForCard failed: ${error.message}`);
  }
}
