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

    if (!stripeKey) {
      return new Response("Stripe not configured", { status: 503 });
    }

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    // If webhook secret is set, verify signature
    // For now we do a simpler approach: parse the event and verify via Stripe API
    let event: any;

    if (webhookSecret && signature) {
      // TODO: implement proper signature verification with crypto
      // For now, we verify the event by retrieving it from Stripe
      const parsed = JSON.parse(body);
      const verifyRes = await fetch(`https://api.stripe.com/v1/events/${parsed.id}`, {
        headers: { Authorization: `Bearer ${stripeKey}` },
      });
      if (!verifyRes.ok) {
        console.error("Event verification failed");
        return new Response("Invalid event", { status: 400 });
      }
      event = await verifyRes.json();
    } else {
      // No webhook secret — parse directly (less secure, ok for dev)
      event = JSON.parse(body);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      const productId = session.metadata?.product_id;

      if (!userId || !productId) {
        console.error("Missing metadata in checkout session", session.id);
        return new Response("Missing metadata", { status: 400 });
      }

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // Grant product access
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
