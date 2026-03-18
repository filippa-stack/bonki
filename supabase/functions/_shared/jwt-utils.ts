// ============================================================
// Still Us — Shared: JWT Utilities (HS256)
// ============================================================
// Used for signing and verifying partner link tokens.
// The secret must be stored in LINKTOKENSECRET env var.

const ALGORITHM = { name: "HMAC", hash: "SHA-256" };

function base64UrlEncode(data: ArrayBuffer): string {
  const bytes = new Uint8Array(data);
  let str = "";
  for (const byte of bytes) str += String.fromCharCode(byte);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function base64UrlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const padding = 4 - (padded.length % 4);
  const decoded = atob(padding === 4 ? padded : padded + "=".repeat(padding));
  return new Uint8Array([...decoded].map((c) => c.charCodeAt(0)));
}

async function getKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    ALGORITHM,
    false,
    ["sign", "verify"]
  );
}

export interface LinkTokenPayload {
  couple_id: string;
  card_id: string;
  card_index: number;
  exp: number; // Unix timestamp seconds
}

/**
 * Sign a link token payload and return a JWT string (HS256).
 */
export async function signLinkToken(
  payload: Omit<LinkTokenPayload, "exp">,
  expiresInSeconds = 7 * 24 * 3600 // 7 days
): Promise<string> {
  const secret = Deno.env.get("LINKTOKENSECRET");
  if (!secret) throw new Error("LINKTOKENSECRET not set");

  const header = { alg: "HS256", typ: "JWT" };
  const fullPayload: LinkTokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };

  const enc = new TextEncoder();
  const headerB64 = base64UrlEncode(enc.encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(enc.encode(JSON.stringify(fullPayload)));
  const signingInput = `${headerB64}.${payloadB64}`;

  const key = await getKey(secret);
  const signature = await crypto.subtle.sign(
    ALGORITHM.name,
    key,
    enc.encode(signingInput)
  );

  return `${signingInput}.${base64UrlEncode(signature)}`;
}

/**
 * Verify a link token. Returns the decoded payload or throws on invalid/expired.
 */
export async function verifyLinkToken(token: string): Promise<LinkTokenPayload> {
  const secret = Deno.env.get("LINKTOKENSECRET");
  if (!secret) throw new Error("LINKTOKENSECRET not set");

  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid token format");

  const [headerB64, payloadB64, signatureB64] = parts;
  const signingInput = `${headerB64}.${payloadB64}`;

  const enc = new TextEncoder();
  const key = await getKey(secret);
  const signatureBytes = base64UrlDecode(signatureB64);

  const valid = await crypto.subtle.verify(
    ALGORITHM.name,
    key,
    signatureBytes,
    enc.encode(signingInput)
  );

  if (!valid) throw new Error("Invalid token signature");

  const payload: LinkTokenPayload = JSON.parse(
    new TextDecoder().decode(base64UrlDecode(payloadB64))
  );

  if (payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token expired");
  }

  return payload;
}
