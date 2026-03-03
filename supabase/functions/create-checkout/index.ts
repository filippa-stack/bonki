import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: "Stripe is not configured yet" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { productId, successUrl, cancelUrl } = await req.json();
    if (!productId) {
      return new Response(JSON.stringify({ error: "productId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user already has access
    const { data: existing } = await supabase
      .from("user_product_access")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ error: "already_purchased" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get product info (use service role to read price)
    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: product } = await adminSupabase
      .from("products")
      .select("id, name, price_sek, stripe_price_id")
      .eq("id", productId)
      .single();

    if (!product || !product.price_sek) {
      return new Response(JSON.stringify({ error: "product_not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Stripe checkout session
    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        mode: "payment",
        "line_items[0][price_data][currency]": "sek",
        "line_items[0][price_data][product_data][name]": product.name,
        "line_items[0][price_data][unit_amount]": String(product.price_sek * 100),
        "line_items[0][quantity]": "1",
        success_url: successUrl || "https://couple-dialogue-space.lovable.app/?purchase=success",
        cancel_url: cancelUrl || "https://couple-dialogue-space.lovable.app/?purchase=cancel",
        "metadata[user_id]": user.id,
        "metadata[product_id]": productId,
        ...(user.email ? { customer_email: user.email } : {}),
      }),
    });

    const session = await stripeRes.json();

    if (!stripeRes.ok) {
      console.error("Stripe error:", session);
      return new Response(JSON.stringify({ error: "stripe_error", detail: session.error?.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
