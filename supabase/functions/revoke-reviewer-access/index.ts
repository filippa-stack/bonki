// ============================================================
// Bonki — revoke-reviewer-access (Track A kill switch)
// ============================================================
// One-shot admin endpoint that neutralizes the App Store reviewer
// bypass shipped in iOS Build 7. Hardcoded to a single email
// (apple.review@bonkistudio.com). Performs four actions:
//
//   1. Look up reviewer user via admin.listUsers()
//   2. Rotate password to a cryptographically random 64-char string
//      (never logged, never returned)
//   3. Delete all rows from user_product_access for that user_id
//   4. Force global sign-out (invalidates all existing refresh tokens)
//
// Auth: hardcoded token query param. Same defense-in-depth pattern as
// reset-reviewer-password — the function can only ever operate on a
// single hardcoded email, so even a leaked token cannot harm other users.
//
// Idempotent — safe to call multiple times. Each call rotates to a
// fresh random password and re-asserts empty entitlements.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const REVIEWER_EMAIL = "apple.review@bonkistudio.com";
// Random shared token, hardcoded. Distinct from reset-reviewer-password's
// token. Function is restricted to a single hardcoded user, so even if
// leaked it cannot be used against any other account.
const REVOKE_TOKEN = "bonki-reviewer-revoke-7e3b1f9c-2026";

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function generateRandomPassword(): string {
  // 64 chars of crypto-random hex. Never logged. Never returned.
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (token !== REVOKE_TOKEN) {
    return jsonResponse({ error: "unauthorized" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "server_misconfigured" }, 500);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Locate reviewer user.
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listErr) {
    return jsonResponse({ error: "list_users_failed", detail: listErr.message }, 500);
  }

  const user = list.users.find(
    (u) => u.email?.toLowerCase() === REVIEWER_EMAIL.toLowerCase(),
  );
  if (!user) {
    return jsonResponse({ error: "reviewer_user_not_found", email: REVIEWER_EMAIL }, 404);
  }

  const userId = user.id;

  // 2. Rotate password to crypto-random value. Never logged.
  const newPassword = generateRandomPassword();
  const { error: updateErr } = await admin.auth.admin.updateUserById(userId, {
    password: newPassword,
  });
  if (updateErr) {
    return jsonResponse(
      { error: "password_rotation_failed", detail: updateErr.message },
      500,
    );
  }

  // 3. Delete all product access rows for the reviewer.
  // deno-lint-ignore no-explicit-any
  const { data: deletedRows, error: deleteErr } = await (admin
    .from("user_product_access") as any)
    .delete()
    .eq("user_id", userId)
    .select("product_id");

  if (deleteErr) {
    return jsonResponse(
      {
        ok: false,
        userId,
        email: REVIEWER_EMAIL,
        passwordRotated: true,
        productAccessDeleted: 0,
        productAccessError: deleteErr.message,
        globalSignOutTriggered: false,
      },
      500,
    );
  }

  const productAccessDeleted = deletedRows?.length ?? 0;

  // 4. Force global sign-out — invalidates every existing refresh token
  //    for this user across all devices.
  // deno-lint-ignore no-explicit-any
  const { error: signOutErr } = await (admin.auth.admin as any).signOut(
    userId,
    "global",
  );

  // Audit trail (visible in edge function logs). Password is never logged.
  console.log(
    JSON.stringify({
      audit: "revoke-reviewer-access",
      userId,
      email: REVIEWER_EMAIL,
      passwordRotated: true,
      productAccessDeleted,
      globalSignOutTriggered: !signOutErr,
      signOutError: signOutErr?.message ?? null,
      timestamp: new Date().toISOString(),
    }),
  );

  return jsonResponse({
    ok: true,
    userId,
    email: REVIEWER_EMAIL,
    passwordRotated: true,
    productAccessDeleted,
    globalSignOutTriggered: !signOutErr,
    signOutError: signOutErr?.message ?? null,
  });
});
