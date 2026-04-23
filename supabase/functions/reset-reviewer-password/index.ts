// One-shot admin function to (re)set the App Store reviewer password.
// Idempotent — safe to call multiple times. Hardcoded to a single account.
//
// Auth: requires the caller to provide a shared secret matching RESET_REVIEWER_SECRET.
// This avoids opening a public password-reset endpoint.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-reset-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const REVIEWER_EMAIL = "apple.review@bonkistudio.com";
const REVIEWER_PASSWORD = "BonkiReview2026";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const providedSecret = req.headers.get("x-reset-secret");
  const expectedSecret = Deno.env.get("RESET_REVIEWER_SECRET");

  if (!expectedSecret || providedSecret !== expectedSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Look up the user by email.
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listErr) {
    return new Response(JSON.stringify({ error: listErr.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const user = list.users.find(
    (u) => u.email?.toLowerCase() === REVIEWER_EMAIL.toLowerCase(),
  );
  if (!user) {
    return new Response(JSON.stringify({ error: "Reviewer user not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { error: updateErr } = await admin.auth.admin.updateUserById(user.id, {
    password: REVIEWER_PASSWORD,
    email_confirm: true,
  });

  if (updateErr) {
    return new Response(JSON.stringify({ error: updateErr.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({ ok: true, userId: user.id, email: REVIEWER_EMAIL }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
