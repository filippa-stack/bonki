const ALLOWED_ORIGINS = [
  "https://couple-dialogue-space.lovable.app",
  "https://id-preview--1604837d-627c-4368-a714-aa6b770c1b8c.lovable.app",
  "https://1604837d-627c-4368-a714-aa6b770c1b8c.lovableproject.com",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080",
];

const CORS_HEADERS_BASE = {
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") || "";
  if (ALLOWED_ORIGINS.includes(origin)) {
    return { ...CORS_HEADERS_BASE, "Access-Control-Allow-Origin": origin };
  }
  // Return headers without Allow-Origin — browser will block the response
  return { ...CORS_HEADERS_BASE };
}

export function isOriginAllowed(req: Request): boolean {
  const origin = req.headers.get("Origin");
  // Non-browser calls (e.g. server-to-server) may omit Origin — allow those
  if (!origin) return true;
  return ALLOWED_ORIGINS.includes(origin);
}

export function handleCors(req: Request): Response | null {
  const headers = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  if (!isOriginAllowed(req)) {
    return new Response(JSON.stringify({ error: "forbidden_origin" }), {
      status: 403,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  return null;
}
