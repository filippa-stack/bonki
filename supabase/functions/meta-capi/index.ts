import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input.trim().toLowerCase());
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;
  const headers = getCorsHeaders(req);

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { event_name, event_id, custom_data, event_source_url, fbc, fbp } = body;

    if (!event_name || typeof event_name !== "string") {
      return new Response(JSON.stringify({ error: "event_name required" }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }
    if (!event_id || typeof event_id !== "string") {
      return new Response(JSON.stringify({ error: "event_id required" }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    const pixelId = Deno.env.get("META_PIXEL_ID");
    const accessToken = Deno.env.get("META_ACCESS_TOKEN");
    if (!pixelId || !accessToken) {
      // Log which ones are missing for debugging
      console.error("Missing secrets — META_PIXEL_ID:", !!pixelId, "META_ACCESS_TOKEN:", !!accessToken);
      // Return 200 to not block client — server-side tracking is best-effort
      return new Response(JSON.stringify({ ok: false, reason: "secrets_not_configured" }), {
        status: 200,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    // Build user_data
    const userData: Record<string, unknown> = {};

    // Hash email from JWT if present
    const authHeader = req.headers.get("authorization") ?? "";
    if (authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.slice(7);
        const payloadB64 = token.split(".")[1];
        const payload = JSON.parse(atob(payloadB64));
        if (payload.email) {
          userData.em = [await sha256(payload.email)];
        }
      } catch {
        // JWT decode failed — continue without email
      }
    }

    // IP and User-Agent from request headers
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      undefined;
    const clientUa = req.headers.get("user-agent") || undefined;

    if (clientIp) userData.client_ip_address = clientIp;
    if (clientUa) userData.client_user_agent = clientUa;
    if (fbc) userData.fbc = fbc;
    if (fbp) userData.fbp = fbp;

    // Build event payload
    const eventData: Record<string, unknown> = {
      event_name,
      event_time: Math.floor(Date.now() / 1000),
      event_id,
      action_source: "website",
      user_data: userData,
    };

    if (event_source_url) eventData.event_source_url = event_source_url;
    if (custom_data && typeof custom_data === "object") {
      eventData.custom_data = custom_data;
    }

    const capiPayload: Record<string, unknown> = {
      data: [eventData],
    };

    // Test mode support
    const testCode = Deno.env.get("META_CAPI_TEST_CODE");
    if (testCode) {
      capiPayload.test_event_code = testCode;
    }

    const url = `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${accessToken}`;

    const metaRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(capiPayload),
    });

    const metaBody = await metaRes.text();

    if (!metaRes.ok) {
      console.error("Meta CAPI error:", metaRes.status, metaBody);
      return new Response(JSON.stringify({ ok: false, reason: "capi_error" }), {
        status: 200,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("meta-capi error:", err);
    return new Response(JSON.stringify({ ok: false, reason: "internal" }), {
      status: 200,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }
});
