// ============================================================
// Bonki — RevenueCat Webhook
// ============================================================
// Receives RevenueCat purchase events from iOS IAP and writes
// product access rows to user_product_access. Mirrors what
// stripe-webhook does for Stripe, but for Apple In-App Purchases.
//
// Auth: shared secret in `Authorization: Bearer <REVENUECAT_WEBHOOK_SECRET>`.
// Configured with verify_jwt = false in supabase/config.toml because
// RevenueCat is a third-party server with no Supabase JWT.
// ============================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const APPLE_PRODUCT_PREFIX = "com.bonkistudio.bonkiapp.";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function stripPrefix(rawProductId: string): { id: string; hadPrefix: boolean } {
  if (rawProductId.startsWith(APPLE_PRODUCT_PREFIX)) {
    return { id: rawProductId.slice(APPLE_PRODUCT_PREFIX.length), hadPrefix: true };
  }
  return { id: rawProductId, hadPrefix: false };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  // ---- Auth ----
  const expectedSecret = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");
  if (!expectedSecret) {
    console.error("❌ REVENUECAT_WEBHOOK_SECRET is not configured");
    return jsonResponse({ error: "Webhook secret not configured" }, 503);
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const expectedHeader = `Bearer ${expectedSecret}`;
  if (authHeader !== expectedHeader) {
    console.error("❌ Unauthorized webhook call — bad/missing Authorization header");
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  // ---- Parse body ----
  let payload: any;
  try {
    payload = await req.json();
  } catch (err) {
    console.error("❌ Failed to parse JSON body:", err);
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const event = payload?.event;
  if (!event || typeof event.type !== "string") {
    console.error("❌ Missing event.type in payload");
    return jsonResponse({ error: "Missing event.type" }, 400);
  }

  const eventType: string = event.type;
  console.log(`📥 Webhook received: ${eventType}`);

  // ---- TEST: dashboard test button ----
  if (eventType === "TEST") {
    return jsonResponse({ received: true, test: true }, 200);
  }

  // ---- Events we explicitly ignore ----
  // CANCELLATION: non-consumables don't truly cancel — just log.
  // EXPIRATION: not applicable to our non-consumable products.
  if (eventType === "CANCELLATION" || eventType === "EXPIRATION") {
    console.log(`ℹ️ Ignoring ${eventType} (non-consumable product)`);
    return jsonResponse({ received: true, ignored: true }, 200);
  }

  // ---- Events that need user + product ----
  const grantTypes = new Set(["INITIAL_PURCHASE", "NON_RENEWING_PURCHASE"]);
  const revokeTypes = new Set(["REFUND"]);
  const needsAccessChange = grantTypes.has(eventType) || revokeTypes.has(eventType);

  if (!needsAccessChange) {
    // Unknown / unhandled type — log and 200 so RevenueCat doesn't retry forever.
    console.log(`ℹ️ Unhandled event type: ${eventType}`);
    return jsonResponse({ received: true, unhandled: true }, 200);
  }

  const appUserId: string | undefined = event.app_user_id;
  const rawProductId: string | undefined = event.product_id;

  if (!appUserId) {
    console.error("❌ Missing event.app_user_id");
    return jsonResponse({ error: "Missing app_user_id" }, 400);
  }
  if (!rawProductId) {
    console.error("❌ Missing event.product_id");
    return jsonResponse({ error: "Missing product_id" }, 400);
  }

  const { id: supabaseProductId, hadPrefix } = stripPrefix(rawProductId);
  if (!hadPrefix) {
    console.warn(
      `⚠️ product_id "${rawProductId}" missing expected "${APPLE_PRODUCT_PREFIX}" prefix — using raw value`,
    );
  }

  // ---- Supabase service-role client (bypasses RLS) ----
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Validate product exists before inserting (prevents garbage rows)
  const { data: productRow, error: productErr } = await supabase
    .from("products")
    .select("id")
    .eq("id", supabaseProductId)
    .maybeSingle();

  if (productErr) {
    console.error("❌ products lookup failed:", productErr);
    return jsonResponse({ error: "Product lookup failed" }, 500);
  }
  if (!productRow) {
    console.error(
      `❌ Unknown product id "${supabaseProductId}" (raw: "${rawProductId}") — not in products table`,
    );
    return jsonResponse({ error: "Unknown product" }, 400);
  }

  // ---- Grant ----
  if (grantTypes.has(eventType)) {
    const { error } = await supabase.from("user_product_access").upsert(
      {
        user_id: appUserId,
        product_id: supabaseProductId,
        granted_at: new Date().toISOString(),
        granted_via: "revenuecat",
      },
      { onConflict: "user_id,product_id" },
    );

    if (error) {
      console.error(`❌ Failed to grant ${supabaseProductId} to ${appUserId}:`, error);
      return jsonResponse({ error: "DB error" }, 500);
    }

    console.log(`✅ Granted ${supabaseProductId} to ${appUserId}`);
    return jsonResponse({ received: true, granted: true }, 200);
  }

  // ---- Revoke (REFUND) ----
  if (revokeTypes.has(eventType)) {
    const { error } = await supabase
      .from("user_product_access")
      .delete()
      .eq("user_id", appUserId)
      .eq("product_id", supabaseProductId);

    if (error) {
      console.error(`❌ Failed to revoke ${supabaseProductId} from ${appUserId}:`, error);
      return jsonResponse({ error: "DB error" }, 500);
    }

    console.log(`✅ Revoked ${supabaseProductId} from ${appUserId} (REFUND)`);
    return jsonResponse({ received: true, revoked: true }, 200);
  }

  // Unreachable
  return jsonResponse({ received: true }, 200);
});
