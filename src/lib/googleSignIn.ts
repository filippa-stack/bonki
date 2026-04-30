import { Capacitor } from '@capacitor/core';
import { SocialLogin } from '@capgo/capacitor-social-login';
import { supabase } from '@/integrations/supabase/client';

export interface GoogleSignInResult {
  success: boolean;
  cancelled?: boolean;
  notNative?: boolean;
  error?: string;
  errorCode?: string | number;
}

/**
 * Web Client ID from Google Cloud project boxwood-well-447809-v4 ("BONKI Web").
 * Used as `webClientId` for the Capgo plugin so the id_token's `aud` claim
 * matches what Supabase verifies. The Android client (same project, package
 * com.bonkistudio.bonkiapp) is matched implicitly via package name + SHA-1
 * and never appears in code. Web Client IDs are not secret (visible in every
 * issued id_token's `aud` claim) — safe to commit.
 */
const GOOGLE_WEB_CLIENT_ID =
  '629196806647-m2r1g9m73n79bbbdvm7524fc5t48frmk.apps.googleusercontent.com';

let googleInitialized = false;

async function ensureGoogleInitialized() {
  if (googleInitialized) return;
  await SocialLogin.initialize({
    google: {
      webClientId: GOOGLE_WEB_CLIENT_ID,
      mode: 'offline',
    },
  });
  googleInitialized = true;
}

function randomString(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

/**
 * SHA-256 hex digest. Per Supabase Google ID-token requirements, the hashed
 * nonce is sent to Google (embedded in id_token's `nonce` claim) and the raw
 * nonce is passed to Supabase, which hashes it server-side and compares.
 */
async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(hashBuffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

/**
 * Native Google Sign-In via Capgo social-login plugin (Android in production).
 * On web, returns a no-op — callers should fall back to the existing Lovable
 * OAuth web flow.
 */
export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  if (!Capacitor.isNativePlatform()) {
    return { success: false, notNative: true };
  }

  const rawNonce = randomString();

  try {
    await ensureGoogleInitialized();
    const hashedNonce = await sha256Hex(rawNonce);

    const loginResult = await SocialLogin.login({
      provider: 'google',
      options: {
        scopes: ['email', 'profile'],
        nonce: hashedNonce,
      },
    });

    // Capgo response shape: { provider: 'google', result: { idToken, ... } }
    const result = (loginResult as unknown as { result?: { idToken?: string } })?.result;
    const idToken = result?.idToken;

    if (!idToken) {
      console.error('[GoogleSignIn] No id_token returned from plugin', loginResult);
      return { success: false, error: 'Ingen identitetstoken mottagen från Google.' };
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
      nonce: rawNonce,
    });

    if (error) {
      console.error('[GoogleSignIn] Supabase signInWithIdToken failed', error);
      return { success: false, error: `Supabase: ${error.message}` };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const code = (err as { code?: string | number })?.code;
    const haystack = `${code ?? ''} ${message}`.toLowerCase();

    // Google Android cancellation: status code 12501, or "canceled"/"cancelled" strings
    if (
      haystack.includes('12501') ||
      haystack.includes('canceled') ||
      haystack.includes('cancelled')
    ) {
      return { success: false, cancelled: true };
    }

    console.error('[GoogleSignIn] Native error', { code, message, err });
    const detail = code ? `[${code}] ${message}` : message;
    return { success: false, error: detail || 'Okänt fel från Google.', errorCode: code };
  }
}
