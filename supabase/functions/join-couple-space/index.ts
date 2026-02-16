import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";
import { handleCors, getCorsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { invite_token, invite_code, partner_name } = await req.json();

    let query = adminClient.from("couple_spaces").select("*");
    if (invite_token) {
      query = query.eq("invite_token", invite_token);
    } else if (invite_code) {
      query = query.eq("invite_code", invite_code.toUpperCase().trim());
    } else {
      return new Response(
        JSON.stringify({ error: "Missing invite_token or invite_code" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: targetSpace, error: spaceError } = await query.maybeSingle();
    if (spaceError || !targetSpace) {
      return new Response(
        JSON.stringify({ error: "invalid_invite" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { count: targetMemberCount } = await adminClient
      .from("couple_members")
      .select("id", { count: "exact", head: true })
      .eq("couple_space_id", targetSpace.id)
      .is("left_at", null);

    if ((targetMemberCount ?? 0) >= 2) {
      return new Response(
        JSON.stringify({ error: "space_full" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: existingMembership } = await adminClient
      .from("couple_members")
      .select("id, couple_space_id")
      .eq("user_id", userId)
      .is("left_at", null)
      .maybeSingle();

    if (existingMembership) {
      const originalSpaceId = existingMembership.couple_space_id;

      if (originalSpaceId === targetSpace.id) {
        return new Response(
          JSON.stringify({ success: true, couple_space_id: targetSpace.id }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { count: originalMemberCount, error: countErr } = await adminClient
        .from("couple_members")
        .select("id", { count: "exact", head: true })
        .eq("couple_space_id", originalSpaceId)
        .is("left_at", null);

      if (countErr) {
        console.error("Count error:", countErr);
        return new Response(
          JSON.stringify({ error: "internal_error" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Archive old membership instead of blocking
      // This allows users to switch partners even if the old space is full
      await adminClient
        .from("couple_members")
        .update({
          left_at: new Date().toISOString(),
          left_reason: "partner_switch",
          left_by: userId,
        })
        .eq("id", existingMembership.id);

      // Migrate data from old space to new space
      await adminClient
        .from("prompt_notes")
        .update({ couple_space_id: targetSpace.id })
        .eq("user_id", userId)
        .eq("couple_space_id", originalSpaceId);

      await adminClient
        .from("reflection_responses")
        .update({ couple_space_id: targetSpace.id })
        .eq("user_id", userId)
        .eq("couple_space_id", originalSpaceId);

      await adminClient
        .from("redundant_purchases")
        .insert({
          user_id: userId,
          original_space_id: originalSpaceId,
          merged_into_space_id: targetSpace.id,
        });

      await adminClient
        .from("couple_progress")
        .delete()
        .eq("couple_space_id", originalSpaceId);
    }

    const { error: joinError } = await adminClient
      .from("couple_members")
      .insert({ couple_space_id: targetSpace.id, user_id: userId, role: "partner_b" });

    if (joinError) {
      console.error("Join error:", joinError);
      return new Response(
        JSON.stringify({ error: "join_failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (partner_name) {
      await adminClient
        .from("couple_spaces")
        .update({ partner_b_name: partner_name })
        .eq("id", targetSpace.id);
    }

    await adminClient
      .from("system_events")
      .insert({
        couple_space_id: targetSpace.id,
        type: "partner_joined",
        payload: { partner_user_id: userId },
      });

    return new Response(
      JSON.stringify({ success: true, couple_space_id: targetSpace.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "internal_error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
