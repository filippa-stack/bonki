// ============================================================
// Bonki — delete-account
// ============================================================
// Apple Guideline 5.1.1(v): server-side account deletion.
// Flow:
//   1. Validate caller JWT → resolve userId
//   2. Best-effort Apple token revocation (POST /auth/revoke)
//   3. Wipe app data via public.delete_user_account RPC
//   4. Remove auth row via auth.admin.deleteUser
//
// `verify_jwt = false` in supabase/config.toml — we validate in code
// using getClaims() to match the rest of the project's pattern.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { SignJWT, importPKCS8 } from "npm:jose@5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Audit log. Edge function logs are persistent and queryable via Supabase
 * dashboard / edge_function_logs tool — sufficient for the Apple-revoke
 * audit trail (we don't have a cross-cutting audit table).
 */
function audit(
  userId: string,
  eventType: string,
  payload: Record<string, unknown> = {},
) {
  console.log(
    JSON.stringify({
      audit: "delete-account",
      event: eventType,
      user_id: userId,
      ...payload,
    }),
  );
}

/**
 * Build Apple client_secret JWT (ES256).
 * Spec: https://developer.apple.com/documentation/sign_in_with_apple/generate_and_validate_tokens
 */
async function buildAppleClientSecret(): Promise<string | null> {
  const teamId = Deno.env.get("APPLE_TEAM_ID");
  const keyId = Deno.env.get("APPLE_KEY_ID");
  const clientId = Deno.env.get("APPLE_CLIENT_ID");
  const privateKeyPem = Deno.env.get("APPLE_PRIVATE_KEY");

  if (!teamId || !keyId || !clientId || !privateKeyPem) {
    console.warn("[delete-account] Apple secrets missing — skipping client_secret build");
    return null;
  }

  // Normalize PEM: env vars sometimes lose newlines.
  const pem = privateKeyPem.includes("BEGIN PRIVATE KEY")
    ? privateKeyPem.replace(/\\n/g, "\n")
    : `-----BEGIN PRIVATE KEY-----\n${privateKeyPem.replace(/\s+/g, "\n")}\n-----END PRIVATE KEY-----`;

  try {
    const privateKey = await importPKCS8(pem, "ES256");
    const now = Math.floor(Date.now() / 1000);

    return await new SignJWT({})
      .setProtectedHeader({ alg: "ES256", kid: keyId })
      .setIssuer(teamId)
      .setIssuedAt(now)
      .setExpirationTime(now + 300)
      .setAudience("https://appleid.apple.com")
      .setSubject(clientId)
      .sign(privateKey);
  } catch (err) {
    console.error("[delete-account] failed to mint Apple client_secret", err);
    return null;
  }
}

/**
 * Best-effort Apple token revocation. Logs outcome to system_events.
 * Returns true if a revoke attempt succeeded (200), false otherwise.
 */
async function attemptAppleRevoke(
  admin: ReturnType<typeof createClient>,
  userId: string,
): Promise<void> {
  // Look up Apple identity for this user.
  const { data: userRes, error: userErr } = await admin.auth.admin.getUserById(userId);
  if (userErr || !userRes?.user) {
    audit(userId, "apple_revoke_skipped_no_identity", {
      reason: userErr?.message ?? "user_not_found",
    });
    return;
  }

  const appleIdentity = userRes.user.identities?.find((i) => i.provider === "apple");
  if (!appleIdentity) {
    audit(userId, "apple_revoke_skipped_not_apple_user", {});
    return;
  }

  // signInWithIdToken (our native Capgo flow) does not yield a refresh token,
  // so identity_data rarely contains one. We still check, in case a web OAuth
  // flow stored one previously.
  const identityData = (appleIdentity.identity_data ?? {}) as Record<string, unknown>;
  const token =
    (identityData.provider_refresh_token as string | undefined) ??
    (identityData.provider_token as string | undefined) ??
    null;
  const tokenTypeHint = identityData.provider_refresh_token
    ? "refresh_token"
    : "access_token";

  if (!token) {
    audit(userId, "apple_revoke_skipped_no_token", {
      provider: "apple",
      note: "Native signInWithIdToken does not persist Apple OAuth tokens. User can manually revoke at appleid.apple.com.",
    });
    return;
  }

  const clientSecret = await buildAppleClientSecret();
  const clientId = Deno.env.get("APPLE_CLIENT_ID");
  if (!clientSecret || !clientId) {
    audit(userId, "apple_revoke_failed_secret_build", {});
    return;
  }

  try {
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      token,
      token_type_hint: tokenTypeHint,
    });

    const res = await fetch("https://appleid.apple.com/auth/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (res.ok) {
      audit(userId, "apple_revoke_succeeded", {
        token_type_hint: tokenTypeHint,
      });
    } else {
      const text = await res.text().catch(() => "");
      audit(userId, "apple_revoke_non_200", {
        status: res.status,
        body: text.slice(0, 500),
      });
    }
  } catch (err) {
    audit(userId, "apple_revoke_threw", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceKey) {
    return jsonResponse({ error: "server_misconfigured" }, 500);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return jsonResponse({ error: "unauthorized" }, 401);
  }
  const token = authHeader.slice("Bearer ".length);

  // Validate JWT
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });

  const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
  if (claimsErr || !claimsData?.claims?.sub) {
    return jsonResponse({ error: "unauthorized" }, 401);
  }
  const userId = claimsData.claims.sub as string;

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // 1. Best-effort Apple revoke (must run BEFORE we delete the auth row,
  // otherwise the identity record is gone).
  await attemptAppleRevoke(admin, userId);

  // 2. Wipe app data via existing RPC.
  const { error: rpcError } = await admin.rpc("delete_user_account", {
    p_user_id: userId,
  });
  if (rpcError) {
    console.error("[delete-account] delete_user_account RPC failed", rpcError);
    audit(userId, "delete_account_rpc_failed", {
      error: rpcError.message,
    });
    return jsonResponse(
      { error: "data_deletion_failed", detail: rpcError.message },
      500,
    );
  }

  // 3. Delete the auth user.
  const { error: authDelError } = await admin.auth.admin.deleteUser(userId);
  if (authDelError) {
    console.error("[delete-account] auth.admin.deleteUser failed", authDelError);
    audit(userId, "delete_account_auth_failed", {
      error: authDelError.message,
    });
    return jsonResponse(
      { error: "auth_deletion_failed", detail: authDelError.message },
      500,
    );
  }

  audit(userId, "delete_account_succeeded", {});

  return jsonResponse({ success: true });
});
