import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

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
    // Auth: verify caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify JWT
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerUserId = claimsData.claims.sub;

    // Parse body
    const body = await req.json();
    const { type, couple_space_id, receiver_user_id, proposal_id, note_id } = body;

    if (!type || !couple_space_id || !receiver_user_id) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Caller must not be the receiver (sanity)
    if (callerUserId === receiver_user_id) {
      return new Response(JSON.stringify({ ok: true, skipped: "self" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service-role client for privileged reads
    const admin = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Verify both users are members of this space
    const { data: members } = await admin
      .from("couple_members")
      .select("user_id")
      .eq("couple_space_id", couple_space_id)
      .is("left_at", null)
      .eq("status", "active");

    const memberIds = (members || []).map((m: any) => m.user_id);
    if (!memberIds.includes(callerUserId) || !memberIds.includes(receiver_user_id)) {
      return new Response(JSON.stringify({ error: "Not members" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Check notification preferences
    const { data: prefs } = await admin
      .from("notification_preferences")
      .select("notify_email_proposal, notify_shared_reflection")
      .eq("user_id", receiver_user_id)
      .maybeSingle();

    const emailProposalEnabled = prefs?.notify_email_proposal ?? false;
    const sharedReflectionEnabled = prefs?.notify_shared_reflection ?? false;

    if (type === "proposal" && !emailProposalEnabled) {
      return new Response(JSON.stringify({ ok: true, skipped: "pref_off" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (type === "shared_reflection" && !sharedReflectionEnabled) {
      return new Response(JSON.stringify({ ok: true, skipped: "pref_off" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Dedupe via system_events (10 min window)
    const dedupeKey = type === "proposal" ? proposal_id : note_id;
    const eventType = `email_${type}`;

    if (dedupeKey) {
      const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { data: existing } = await admin
        .from("system_events")
        .select("id")
        .eq("couple_space_id", couple_space_id)
        .eq("type", eventType)
        .gte("created_at", tenMinAgo)
        .limit(100);

      // Check payload for matching dedupe key
      if (existing && existing.length > 0) {
        // Fetch full events to check payload
        const { data: fullEvents } = await admin
          .from("system_events")
          .select("id, payload")
          .eq("couple_space_id", couple_space_id)
          .eq("type", eventType)
          .gte("created_at", tenMinAgo);

        const isDupe = (fullEvents || []).some(
          (e: any) => e.payload?.dedupe_key === dedupeKey
        );

        if (isDupe) {
          return new Response(JSON.stringify({ ok: true, skipped: "dedupe" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    // 4. Get receiver email
    const { data: { user: receiverUser }, error: userErr } = await admin.auth.admin.getUserById(
      receiver_user_id
    );

    if (userErr || !receiverUser?.email) {
      return new Response(JSON.stringify({ error: "Could not resolve receiver email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 5. Send email via Resend
    const emailConfig = type === "proposal"
      ? {
          subject: "Du har fått ett samtalsförslag",
          html: "<p>Din partner föreslog ett samtal i Still Us.</p>",
        }
      : {
          subject: "Din partner delade en tanke",
          html: "<p>Din partner delade en tanke i Still Us.</p>",
        };

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Still Us <onboarding@resend.dev>",
        to: [receiverUser.email],
        subject: emailConfig.subject,
        html: emailConfig.html,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error("Resend error:", resendData);
      return new Response(JSON.stringify({ error: "Email send failed", details: resendData }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 6. Log dedupe event
    if (dedupeKey) {
      await admin.from("system_events").insert({
        couple_space_id,
        type: eventType,
        payload: { dedupe_key: dedupeKey, receiver: receiver_user_id },
      });
    }

    return new Response(JSON.stringify({ ok: true, email_id: resendData.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
