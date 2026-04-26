// One-shot admin function to (re)set the App Store reviewer password AND
// seed product access for all 7 Bonki products.
// Idempotent — safe to call multiple times. Hardcoded to a single account.
//
// Auth: requires a hardcoded token query param. Not a public endpoint —
// this exists solely so the build agent can reset the reviewer password
// in Test and Live without manual SQL on auth.users.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const REVIEWER_EMAIL = "apple.review@bonkistudio.com";
const REVIEWER_PASSWORD = "BonkiReview2026";
// Random shared token, hardcoded here. Function is also restricted to a single
// hardcoded user, so even if leaked it cannot reset arbitrary accounts.
const RESET_TOKEN = "bonki-reviewer-reset-9f4e2a1c-2026";

// All 7 Bonki products — must match products.id in the public schema.
const ALL_PRODUCT_IDS = [
  "still_us",
  "jag_i_mig",
  "jag_i_varlden",
  "jag_med_andra",
  "sexualitetskort",
  "syskonkort",
  "vardagskort",
] as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (token !== RESET_TOKEN) {
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

  // Seed product access for all 7 products. Idempotent via UNIQUE(user_id, product_id).
  const rows = ALL_PRODUCT_IDS.map((product_id) => ({
    user_id: user.id,
    product_id,
    granted_via: "reviewer_grant",
  }));

  const { error: upsertErr } = await admin
    .from("user_product_access")
    .upsert(rows, { onConflict: "user_id,product_id", ignoreDuplicates: true });

  if (upsertErr) {
    return new Response(
      JSON.stringify({
        ok: false,
        userId: user.id,
        email: REVIEWER_EMAIL,
        passwordReset: true,
        productAccessError: upsertErr.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Verify final state
  const { data: access, error: accessErr } = await admin
    .from("user_product_access")
    .select("product_id")
    .eq("user_id", user.id);

  return new Response(
    JSON.stringify({
      ok: true,
      userId: user.id,
      email: REVIEWER_EMAIL,
      passwordReset: true,
      products: access?.map((r) => r.product_id).sort() ?? [],
      productCount: access?.length ?? 0,
      accessError: accessErr?.message ?? null,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
