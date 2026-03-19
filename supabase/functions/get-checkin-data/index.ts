// ============================================================
// Still Us — Edge Function: get-checkin-data
// ============================================================
// Lightweight GET endpoint for the Tier 1 check-in web page.
// Verifies the partner link_token and returns slider anchors
// + card metadata so the page can render real labels.
//
// Input: ?token=<link_token>
// Returns: { card_title, card_index, sliders: [{text, leftLabel, rightLabel}] }
//
// Auth: link_token verification (no Supabase JWT needed — partner is anonymous).

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase-client.ts";
import { verifyLinkToken } from "../_shared/jwt-utils.ts";

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  const headers = getCorsHeaders(req);

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return jsonResponse({ error: "missing_token" }, 400, headers);
    }

    // Verify link token (HS256 JWT)
    let payload;
    try {
      payload = await verifyLinkToken(token);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "invalid_token";
      return jsonResponse({ error: msg }, 401, headers);
    }

    const { couple_id, card_index } = payload;

    const supabase = createServiceClient();

    // Read current_slider_anchors from couple_state
    const { data: couple, error } = await supabase
      .from("couple_state")
      .select("current_slider_anchors, current_card_index, dissolved_at")
      .eq("couple_id", couple_id)
      .single();

    if (error || !couple) {
      return jsonResponse({ error: "couple_not_found" }, 404, headers);
    }

    if (couple.dissolved_at) {
      return jsonResponse({ error: "dissolved" }, 200, headers);
    }

    // Return slider anchors (may be null if not yet written)
    const anchors = couple.current_slider_anchors as {
      card_title?: string;
      reflection_prompt?: string;
      sliders?: { text: string; leftLabel: string; rightLabel: string }[];
    } | null;

    return jsonResponse({
      card_index: couple.current_card_index,
      card_title: anchors?.card_title ?? null,
      reflection_prompt: anchors?.reflection_prompt ?? null,
      sliders: anchors?.sliders ?? [],
    }, 200, headers);
  } catch (err) {
    console.error("get-checkin-data error:", err);
    return jsonResponse({ error: "internal_error" }, 500, headers);
  }
});

function jsonResponse(body: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
