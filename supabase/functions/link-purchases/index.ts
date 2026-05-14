import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Missing authorization" }, 401);
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return jsonResponse({ error: "Invalid session" }, 401);
    }
    const requesterUser = userData.user;

    let body: { sourceUserId?: unknown };
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }
    const sourceUserId = body?.sourceUserId;
    if (!sourceUserId || typeof sourceUserId !== "string") {
      return jsonResponse({ error: "Missing sourceUserId" }, 400);
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // No-op if requester entered their own email
    if (sourceUserId === requesterUser.id) {
      await adminClient.from("purchase_link_audit").insert({
        requester_user_id: requesterUser.id,
        source_email: requesterUser.email ?? "",
        source_user_id: sourceUserId,
        products_linked: 0,
        products_already_owned: 0,
        status: "success",
      });
      return jsonResponse({
        products_linked: 0,
        products_already_owned: 0,
        same_account: true,
      });
    }

    // Resolve source user (for audit email + existence check)
    const { data: sourceUserData, error: sourceErr } =
      await adminClient.auth.admin.getUserById(sourceUserId);
    if (sourceErr || !sourceUserData?.user) {
      await adminClient.from("purchase_link_audit").insert({
        requester_user_id: requesterUser.id,
        source_email: "",
        source_user_id: sourceUserId,
        products_linked: 0,
        products_already_owned: 0,
        status: "source_not_found",
      });
      return jsonResponse({ error: "Source account not found" }, 404);
    }
    const sourceEmail = sourceUserData.user.email ?? "";

    // Fetch source's purchases
    const { data: sourceAccess, error: accessErr } = await adminClient
      .from("user_product_access")
      .select("product_id, granted_at, granted_via")
      .eq("user_id", sourceUserId);

    if (accessErr) {
      await adminClient.from("purchase_link_audit").insert({
        requester_user_id: requesterUser.id,
        source_email: sourceEmail,
        source_user_id: sourceUserId,
        products_linked: 0,
        products_already_owned: 0,
        status: "error",
        error_message: accessErr.message,
      });
      return jsonResponse({ error: "Lookup failed" }, 500);
    }

    if (!sourceAccess || sourceAccess.length === 0) {
      await adminClient.from("purchase_link_audit").insert({
        requester_user_id: requesterUser.id,
        source_email: sourceEmail,
        source_user_id: sourceUserId,
        products_linked: 0,
        products_already_owned: 0,
        status: "no_purchases_found",
      });
      return jsonResponse({
        products_linked: 0,
        products_already_owned: 0,
      });
    }

    // What requester already owns
    const { data: existingAccess } = await adminClient
      .from("user_product_access")
      .select("product_id")
      .eq("user_id", requesterUser.id);
    const alreadyOwned = new Set(
      (existingAccess ?? []).map((r: { product_id: string }) => r.product_id),
    );

    const toInsert = sourceAccess
      .filter(
        (r: { product_id: string }) => !alreadyOwned.has(r.product_id),
      )
      .map(
        (r: {
          product_id: string;
          granted_at: string;
          granted_via: string;
        }) => ({
          user_id: requesterUser.id,
          product_id: r.product_id,
          granted_at: r.granted_at,
          granted_via: r.granted_via,
        }),
      );

    let linked = 0;
    if (toInsert.length > 0) {
      const { error: insertErr } = await adminClient
        .from("user_product_access")
        .upsert(toInsert, {
          onConflict: "user_id,product_id",
          ignoreDuplicates: true,
        });
      if (insertErr) {
        await adminClient.from("purchase_link_audit").insert({
          requester_user_id: requesterUser.id,
          source_email: sourceEmail,
          source_user_id: sourceUserId,
          products_linked: 0,
          products_already_owned: alreadyOwned.size,
          status: "error",
          error_message: insertErr.message,
        });
        return jsonResponse({ error: "Migration failed" }, 500);
      }
      linked = toInsert.length;
    }

    const alreadyOwnedCount = sourceAccess.length - linked;

    await adminClient.from("purchase_link_audit").insert({
      requester_user_id: requesterUser.id,
      source_email: sourceEmail,
      source_user_id: sourceUserId,
      products_linked: linked,
      products_already_owned: alreadyOwnedCount,
      status: "success",
    });

    return jsonResponse({
      products_linked: linked,
      products_already_owned: alreadyOwnedCount,
    });
  } catch (err) {
    console.error("[link-purchases] unexpected error", err);
    return jsonResponse({ error: "Unexpected error" }, 500);
  }
});
