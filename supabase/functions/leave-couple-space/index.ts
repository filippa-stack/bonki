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

    const { couple_space_id, reason } = await req.json();

    if (!couple_space_id) {
      return new Response(JSON.stringify({ error: "Missing couple_space_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: membership, error: memError } = await adminClient
      .from("couple_members")
      .select("id")
      .eq("user_id", userId)
      .eq("couple_space_id", couple_space_id)
      .is("left_at", null)
      .maybeSingle();

    if (memError || !membership) {
      return new Response(JSON.stringify({ error: "not_a_member" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: leaveError } = await adminClient
      .from("couple_members")
      .update({
        status: "left",
        left_at: new Date().toISOString(),
        left_by: userId,
        left_reason: reason || null,
      })
      .eq("id", membership.id);

    if (leaveError) {
      console.error("Leave error:", leaveError);
      return new Response(JSON.stringify({ error: "leave_failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await adminClient
      .from("system_events")
      .insert({
        couple_space_id,
        type: "member_left",
        payload: { user_id: userId },
      });

    // Always cancel active sessions when a member leaves
    await adminClient
      .from("couple_sessions")
      .update({ status: "cancelled", ended_at: new Date().toISOString() })
      .eq("couple_space_id", couple_space_id)
      .eq("status", "active");

    return new Response(
      JSON.stringify({ success: true }),
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
