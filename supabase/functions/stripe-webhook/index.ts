import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    console.log('STRIPE_SECRET_KEY present:', !!stripeKey, 'length:', stripeKey?.length);
    console.log('STRIPE_WEBHOOK_SECRET present:', !!webhookSecret);

    if (!stripeKey) {
      return new Response("Stripe not configured", { status: 503 });
    }

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not set — refusing unverified webhook");
      return new Response("Webhook secret not configured", { status: 503 });
    }
    if (!signature) {
      console.error("Missing stripe-signature header");
      return new Response("Missing signature", { status: 400 });
    }

    // Verify signature against Stripe's signing algorithm.
    // Stripe signs payloads as: t=<timestamp>,v1=<hex-hmac-sha256>
    let event: any;
    try {
      const parts = signature.split(",").reduce<Record<string, string>>((acc, part) => {
        const [k, v] = part.split("=");
        if (k && v) acc[k.trim()] = v.trim();
        return acc;
      }, {});
      const timestamp = parts["t"];
      const v1 = parts["v1"];
      if (!timestamp || !v1) throw new Error("Malformed stripe-signature header");

      const payload = `${timestamp}.${body}`;
      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(webhookSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
      const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
      const sigHex = Array.from(new Uint8Array(sigBuf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      if (sigHex !== v1) {
        console.error("Stripe signature mismatch");
        return new Response("Invalid signature", { status: 400 });
      }

      event = JSON.parse(body);
    } catch (err) {
      console.error("Signature verification failed:", err);
      return new Response("Signature verification failed", { status: 400 });
    }

    console.log('Webhook received event type:', event.type, 'livemode:', event.livemode);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const metadataUserId = session.metadata?.user_id;
      const productId = session.metadata?.product_id;
      const rawEmail: string | undefined = session.customer_details?.email;

      if (!productId) {
        console.error("Missing product_id metadata", session.id);
        return new Response("Missing product_id", { status: 400 });
      }

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      let userId: string | null = null;

      if (metadataUserId) {
        // Path A: in-app authenticated flow — user_id was attached at create-checkout time
        userId = metadataUserId;
        console.log(`In-app flow: using metadata user_id ${userId}`);
      } else if (rawEmail) {
        // Path B: website-direct flow — derive user from Stripe-collected email
        const email = rawEmail.trim().toLowerCase();
        console.log(`Website flow: resolving user for email ${email}`);

        // Try to find existing user by email
        const { data: listData, error: listErr } = await supabase.auth.admin.listUsers();
        if (listErr) {
          console.error("Failed to list users:", listErr);
          return new Response("Auth list error", { status: 500 });
        }
        const existing = listData.users.find((u: any) => (u.email ?? "").toLowerCase() === email);

        if (existing) {
          userId = existing.id;
          console.log(`Found existing user ${userId} for ${email}`);
        } else {
          const { data: created, error: createErr } = await supabase.auth.admin.createUser({
            email,
            email_confirm: true,
          });
          if (createErr || !created?.user) {
            // Race: another webhook retry may have created the user between list and create
            if (createErr?.message?.toLowerCase().includes("already")) {
              const { data: retryList } = await supabase.auth.admin.listUsers();
              const retryFound = retryList?.users.find((u: any) => (u.email ?? "").toLowerCase() === email);
              if (retryFound) {
                userId = retryFound.id;
                console.log(`Race-recovered user ${userId} for ${email}`);
              } else {
                console.error("createUser failed and retry list did not find user:", createErr);
                return new Response("User creation failed", { status: 500 });
              }
            } else {
              console.error("createUser failed:", createErr);
              return new Response("User creation failed", { status: 500 });
            }
          } else {
            userId = created.user.id;
            console.log(`Created new user ${userId} for ${email}`);
          }
        }
      } else {
        console.error("Session has neither metadata.user_id nor customer_details.email", session.id);
        return new Response("Cannot resolve user", { status: 400 });
      }

      if (!userId) {
        console.error("userId resolution ended null");
        return new Response("User resolution failed", { status: 500 });
      }

      // Grant product access — upsert is idempotent across webhook retries
      const { error } = await supabase.from("user_product_access").upsert(
        {
          user_id: userId,
          product_id: productId,
          granted_at: new Date().toISOString(),
          granted_via: "stripe",
        },
        { onConflict: "user_id,product_id" }
      );

      if (error) {
        console.error("Failed to grant access:", error);
        return new Response("DB error", { status: 500 });
      }

      console.log(`✅ Granted ${productId} access to user ${userId}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Webhook error", { status: 500 });
  }
});
