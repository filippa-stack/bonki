import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";
import { handleCors, getCorsHeaders } from "../_shared/cors.ts";

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const arr = new Uint8Array(6);
  crypto.getRandomValues(arr);
  for (const byte of arr) {
    code += chars[byte % chars.length];
  }
  return code;
}

function generateInviteToken(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

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
      return json({ error: "Unauthorized" }, 401);
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return json({ error: "Unauthorized" }, 401);
    }
    const userId = claimsData.claims.sub as string;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1) Find current active membership
    const { data: membership, error: memErr } = await admin
      .from("couple_members")
      .select("id, couple_space_id")
      .eq("user_id", userId)
      .is("left_at", null)
      .eq("status", "active")
      .maybeSingle();

    if (memErr) {
      console.error("Membership lookup error:", memErr);
      return json({ error: "internal_error" }, 500);
    }

    // 2) Mark old membership as left
    if (membership) {
      const { error: leaveErr } = await admin
        .from("couple_members")
        .update({
          status: "left",
          left_at: new Date().toISOString(),
          left_by: userId,
          left_reason: "switch_space",
        })
        .eq("id", membership.id);

      if (leaveErr) {
        console.error("Leave error:", leaveErr);
        return json({ error: "leave_failed" }, 500);
      }

      // Invalidate old space's invite tokens so old links can't be used
      await admin
        .from("couple_spaces")
        .update({
          invite_code: generateInviteCode(),
          invite_token: generateInviteToken(),
        })
        .eq("id", membership.couple_space_id);

      // Clear shared session state so remaining partner isn't stuck
      await admin
        .from("couple_progress")
        .update({ current_session: null, updated_by: userId })
        .eq("couple_space_id", membership.couple_space_id);

      // Cancel any active normalized sessions for this space
      await admin
        .from("couple_sessions")
        .update({ status: "cancelled", ended_at: new Date().toISOString() } as any)
        .eq("couple_space_id", membership.couple_space_id)
        .eq("status", "active");

      // Cancel all pending proposals for this space
      await admin
        .from("topic_proposals")
        .update({ status: "cancelled" } as any)
        .eq("couple_space_id", membership.couple_space_id)
        .eq("status", "pending");

      // Emit system event so remaining partner gets notified
      await admin
        .from("system_events")
        .insert({
          couple_space_id: membership.couple_space_id,
          type: "partner_left_space",
          payload: { user_id: userId },
        });
    }

    // 3) Create new couple_space
    const newSpaceId = crypto.randomUUID();
    const inviteCode = generateInviteCode();
    const inviteToken = generateInviteToken();
    const { error: spaceErr } = await admin
      .from("couple_spaces")
      .insert({
        id: newSpaceId,
        invite_code: inviteCode,
        invite_token: inviteToken,
      });

    if (spaceErr) {
      console.error("Space insert error:", spaceErr);
      return json({ error: "space_creation_failed" }, 500);
    }

    // Add user as active member
    const { error: memberErr } = await admin
      .from("couple_members")
      .insert({
        couple_space_id: newSpaceId,
        user_id: userId,
        role: "partner_a",
        status: "active",
      });

    if (memberErr) {
      console.error("Member insert error:", memberErr);
      await admin.from("couple_spaces").delete().eq("id", newSpaceId);
      return json({ error: "membership_creation_failed" }, 500);
    }

    // 4) Create couple_progress
    await admin
      .from("couple_progress")
      .insert({
        couple_space_id: newSpaceId,
        current_session: null,
        journey_state: null,
        updated_by: userId,
      } as any);

    // 5) Return new space id
    return json({ ok: true, new_space_id: newSpaceId, invite_code: inviteCode, invite_token: inviteToken });
  } catch (err) {
    console.error("Unexpected error:", err);
    return json({ error: "internal_error" }, 500);
  }
});
