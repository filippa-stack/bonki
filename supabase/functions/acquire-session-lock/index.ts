// ============================================================
// Still Us — Edge Function: acquire-session-lock
// ============================================================
// Input: { couple_id, card_id, device_id, session_number }
// Returns: { status: 'acquired' | 'blocked' | 'dissolved' | 'error' }
//
// CRITICAL: session_lock stores { locked_by_device_id, locked_at, user_id }.
// The user_id field is required — it is used by complete-session and
// advance-card to resolve the writer's identity for takeaway writes.
// Without user_id in the lock, Tier 3 couples where the partner holds
// the device would have takeaways written to the wrong user.
//
// Lock is stale after 180 seconds (3 minutes).
// RULE 6: dissolved_at guard.

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase-client.ts";

const LOCK_STALE_SECONDS = 180;

Deno.serve(async (req: Request) => {

  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  const headers = getCorsHeaders(req);

  try {
    const { couple_id, card_id, device_id, session_number } = await req.json();

    if (!couple_id || !card_id || !device_id) {
      return jsonResponse({ status: "error", message: "Missing required fields" }, 400, headers);
    }

    const supabase = createServiceClient();

    // RULE 6: dissolved_at guard
    const { data: couple, error: coupleErr } = await supabase
      .from("couple_state")
      .select("dissolved_at, cycle_id, initiator_id, partner_id, partner_tier")
      .eq("couple_id", couple_id)
      .single();

    if (coupleErr || !couple) {
      return jsonResponse({ status: "error", message: "Couple not found" }, 404, headers);
    }
    if (couple.dissolved_at) {
      return jsonResponse({ status: "dissolved" }, 200, headers);
    }

    const cycle_id: number = couple.cycle_id;

    // Read current session_lock
    const { data: sessionState, error: ssErr } = await supabase
      .from("session_state")
      .select("session_lock, started_at")
      .eq("couple_id", couple_id)
      .eq("card_id", card_id)
      .eq("cycle_id", cycle_id)
      .single();

    if (ssErr || !sessionState) {
      return jsonResponse({ status: "error", message: "Session state not found" }, 404, headers);
    }

    const lock = sessionState.session_lock as {
      locked_by_device_id: string;
      locked_at: string;
      user_id: string;
    } | null;

    const now = new Date();

    // Determine if lock is absent or stale
    const isStale =
      !lock ||
      (now.getTime() - new Date(lock.locked_at).getTime()) / 1000 > LOCK_STALE_SECONDS;

    if (!lock || isStale) {
      // Resolve the user_id of the caller from their device context.
      // The caller's user_id must be passed for correct takeaway attribution.
      // We derive it from the JWT in the Authorization header if available,
      // otherwise fall back to initiator_id (Tier 1/2 single-device cases).
      const callerUserId = await resolveCallerUserId(req, couple);

      await writeLock(supabase, couple_id, card_id, cycle_id, device_id, callerUserId, now);

      // Set started_at on first acquisition (if not already set)
      if (!sessionState.started_at) {
        await supabase
          .from("session_state")
          .update({ started_at: now.toISOString() })
          .eq("couple_id", couple_id)
          .eq("card_id", card_id)
          .eq("cycle_id", cycle_id);
      }

      return jsonResponse({ status: "acquired" }, 200, headers);
    }

    if (lock.locked_by_device_id === device_id) {
      // Same device: refresh locked_at, keep user_id
      await writeLock(supabase, couple_id, card_id, cycle_id, device_id, lock.user_id, now);
      return jsonResponse({ status: "acquired" }, 200, headers);
    }

    // Different device, active lock
    return jsonResponse({ status: "blocked" }, 200, headers);
  } catch (err) {
    console.error("acquire-session-lock error:", err);
    return jsonResponse({ status: "error", message: String(err) }, 500, headers);
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * Resolve the caller's user_id from the Authorization JWT, falling back to initiator_id.
 * In Supabase Edge Functions, `req` has the auth header from the client SDK call.
 */
async function resolveCallerUserId(
  req: Request,
  couple: { initiator_id: string; partner_id: string | null; partner_tier: string }
): Promise<string> {
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return couple.initiator_id;

    // Decode the JWT payload (no verification needed — Supabase already verified it)
    const parts = token.split(".");
    if (parts.length !== 3) return couple.initiator_id;
    const payloadB64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padding = 4 - (payloadB64.length % 4);
    const padded = payloadB64 + (padding < 4 ? "=".repeat(padding) : "");
    const payload = JSON.parse(atob(padded));
    const sub = payload.sub as string | undefined;
    if (!sub) return couple.initiator_id;
    return sub;
  } catch {
    return couple.initiator_id;
  }
}

async function writeLock(
  supabase: ReturnType<typeof createServiceClient>,
  coupleId: string,
  cardId: string,
  cycleId: number,
  deviceId: string,
  userId: string,
  now: Date
) {
  const { error } = await supabase
    .from("session_state")
    .update({
      session_lock: {
        locked_by_device_id: deviceId,
        locked_at: now.toISOString(),
        user_id: userId,
      },
    })
    .eq("couple_id", coupleId)
    .eq("card_id", cardId)
    .eq("cycle_id", cycleId);

  if (error) throw error;
}

function jsonResponse(body: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
