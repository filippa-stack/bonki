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
    // --- Auth ---
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

    // --- Step 1: Find current active membership ---
    const { data: currentMembership, error: memErr } = await admin
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

    // --- Step 2: Mark old membership as left ---
    if (currentMembership) {
      const { error: leaveErr } = await admin
        .from("couple_members")
        .update({
          status: "left",
          left_at: new Date().toISOString(),
          left_by: userId,
          left_reason: "partner_switch",
        })
        .eq("id", currentMembership.id);

      if (leaveErr) {
        console.error("Leave error:", leaveErr);
        return json({ error: "leave_failed" }, 500);
      }

      // Always cancel active sessions when a member leaves
      await admin
        .from("couple_sessions")
        .update({ status: "cancelled", ended_at: new Date().toISOString() })
        .eq("couple_space_id", currentMembership.couple_space_id)
        .eq("status", "active");

      // Find the remaining partner (receiver of the event)
      const { data: remainingMember } = await admin
        .from("couple_members")
        .select("user_id")
        .eq("couple_space_id", currentMembership.couple_space_id)
        .neq("user_id", userId)
        .is("left_at", null)
        .eq("status", "active")
        .maybeSingle();

      // Emit partner_switched — consumed by PartnerLeftBanner on the receiver's side
      await admin.from("system_events").insert({
        couple_space_id: currentMembership.couple_space_id,
        type: "partner_switched",
        payload: {
          actor_user_id: userId,
          user_id: remainingMember?.user_id ?? null,
          reason: "switch_partner",
        },
      });

      // Also emit legacy member_left for backward compatibility
      await admin.from("system_events").insert({
        couple_space_id: currentMembership.couple_space_id,
        type: "member_left",
        payload: { user_id: userId, reason: "partner_switch" },
      });
    }

    // --- Step 3: Create new couple_space ---
    const newSpaceId = crypto.randomUUID();
    const inviteCode = generateInviteCode();
    const inviteToken = generateInviteToken();

    const { error: spaceErr } = await admin
      .from("couple_spaces")
      .insert({ id: newSpaceId, invite_code: inviteCode, invite_token: inviteToken });

    if (spaceErr) {
      console.error("Space insert error:", spaceErr);
      return json({ error: "space_creation_failed" }, 500);
    }

    // --- Step 4: Add user as first member ---
    const { error: memberErr } = await admin
      .from("couple_members")
      .insert({ couple_space_id: newSpaceId, user_id: userId, role: "partner_a", status: "active" });

    if (memberErr) {
      console.error("Member insert error:", memberErr);
      // Rollback space
      await admin.from("couple_spaces").delete().eq("id", newSpaceId);
      return json({ error: "membership_creation_failed" }, 500);
    }

    // --- Step 5: Create initial couple_progress ---
    await admin
      .from("couple_progress")
      .insert({
        couple_space_id: newSpaceId,
        journey_state: null,
        updated_by: userId,
      } as any)
      .then(({ error }) => {
        if (error && error.code !== "23505") {
          console.error("Progress insert error:", error);
        }
      });

    await admin.from("system_events").insert({
      couple_space_id: newSpaceId,
      type: "couple_created",
      payload: { created_by: userId, from_switch: !!currentMembership },
    });

    // --- Step 6: Return new space ---
    const { data: newSpace, error: readErr } = await admin
      .from("couple_spaces")
      .select("id, partner_a_name, partner_b_name, created_at")
      .eq("id", newSpaceId)
      .single();

    if (readErr) {
      console.error("Space read error:", readErr);
      return json({ error: "internal_error" }, 500);
    }

    return json({ space: newSpace, memberCount: 1, role: "partner_a" }, 201);
  } catch (err) {
    console.error("Unexpected error:", err);
    return json({ error: "internal_error" }, 500);
  }
});
