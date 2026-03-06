import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleCors, getCorsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: existing, error: existErr } = await adminClient
      .from("couple_members")
      .select("couple_space_id")
      .eq("user_id", userId)
      .is("left_at", null)
      .maybeSingle();

    if (existErr) {
      console.error("Membership check error:", existErr);
      return new Response(JSON.stringify({ error: "internal_error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (existing) {
      const { data: spaceData, error: spaceErr } = await adminClient
        .from("couple_spaces")
        .select("id, partner_a_name, partner_b_name, created_at")
        .eq("id", existing.couple_space_id)
        .single();

      if (spaceErr) {
        console.error("Space fetch error:", spaceErr);
        return new Response(JSON.stringify({ error: "internal_error" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { count } = await adminClient
        .from("couple_members")
        .select("id", { count: "exact", head: true })
        .eq("couple_space_id", existing.couple_space_id)
        .is("left_at", null);

      return new Response(
        JSON.stringify({ space: spaceData, memberCount: count ?? 1, role: "partner_a" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const spaceId = crypto.randomUUID();
    const inviteCode = generateInviteCode();
    const inviteToken = generateInviteToken();

    const { error: spaceInsertErr } = await adminClient
      .from("couple_spaces")
      .insert({ id: spaceId, invite_code: inviteCode, invite_token: inviteToken });

    if (spaceInsertErr) {
      console.error("Space insert error:", spaceInsertErr);
      return new Response(JSON.stringify({ error: "space_creation_failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: memberInsertErr } = await adminClient
      .from("couple_members")
      .insert({ couple_space_id: spaceId, user_id: userId, role: "partner_a" });

    if (memberInsertErr) {
      console.error("Member insert error:", memberInsertErr);
      await adminClient.from("couple_spaces").delete().eq("id", spaceId);
      return new Response(JSON.stringify({ error: "membership_creation_failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert initial progress row; ON CONFLICT DO NOTHING ensures idempotency
    await adminClient
      .from("couple_progress")
      .insert({
        couple_space_id: spaceId,
        journey_state: null,
        updated_by: userId,
      } as any)
      .then(({ error }) => {
        // Ignore unique violation (row already exists)
        if (error && error.code !== '23505') {
          console.error("Progress insert error:", error);
        }
      });

    await adminClient
      .from("system_events")
      .insert({
        couple_space_id: spaceId,
        type: "couple_created",
        payload: { created_by: userId },
      });

    const { data: newSpace, error: readErr } = await adminClient
      .from("couple_spaces")
      .select("id, partner_a_name, partner_b_name, created_at")
      .eq("id", spaceId)
      .single();

    if (readErr) {
      console.error("Space read error:", readErr);
      return new Response(JSON.stringify({ error: "internal_error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ space: newSpace, memberCount: 1, role: "partner_a" }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
