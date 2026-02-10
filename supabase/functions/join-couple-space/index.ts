import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate caller
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

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = authUser.id;

    // Use service role for cross-user reads
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { invite_token, invite_code, partner_name } = await req.json();

    // Check if user already belongs to a couple space
    const { data: existingMembership } = await adminClient
      .from("couple_members")
      .select("id, couple_space_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingMembership) {
      return new Response(
        JSON.stringify({ error: "already_member", couple_space_id: existingMembership.couple_space_id }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find couple space by token or code
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

    const { data: space, error: spaceError } = await query.maybeSingle();
    if (spaceError || !space) {
      return new Response(
        JSON.stringify({ error: "invalid_invite" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check how many members already
    const { count } = await adminClient
      .from("couple_members")
      .select("id", { count: "exact", head: true })
      .eq("couple_space_id", space.id);

    if ((count ?? 0) >= 2) {
      return new Response(
        JSON.stringify({ error: "space_full" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Join: create membership
    const { error: joinError } = await adminClient
      .from("couple_members")
      .insert({ couple_space_id: space.id, user_id: userId, role: "partner_b" });

    if (joinError) {
      console.error("Join error:", joinError);
      return new Response(
        JSON.stringify({ error: "join_failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update partner_b_name if provided
    if (partner_name) {
      await adminClient
        .from("couple_spaces")
        .update({ partner_b_name: partner_name })
        .eq("id", space.id);
    }

    return new Response(
      JSON.stringify({ success: true, couple_space_id: space.id }),
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
