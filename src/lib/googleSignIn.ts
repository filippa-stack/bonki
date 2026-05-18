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
 * and never appears in code. Client IDs are not secret (visible in every
 * issued id_token's `aud` claim) — safe to commit.
 */
const GOOGLE_WEB_CLIENT_ID =
  '629196806647-m2r1g9m73n79bbbdvm7524fc5t48frmk.apps.googleusercontent.com';

/**
 * iOS Client ID from the same Google Cloud project ("BONKI iOS").
 * Required at the JS init layer because the Capgo plugin has no implicit
 * package-match mechanism on iOS — unlike Android, where the Android client
 * is matched via package name + SHA-1 without JS configuration. Without
 * this, SocialLogin.initialize silently skips initializing the Google
 * provider on iOS, causing "No provider was initialized" at login time.
 *
 * iOSServerClientId equals webClientId: it tells the plugin which audience
 * Supabase will verify against (Supabase expects the Web Client ID in the
 * aud claim, not the iOS Client ID).
 */
const GOOGLE_IOS_CLIENT_ID =
  '629196806647-960ga3kinh5v280ft77rpn04artkeqnc.apps.googleusercontent.com';

let googleInitialized = false;

async function ensureGoogleInitialized() {
  if (googleInitialized) return;
  await SocialLogin.initialize({
    google: {
      webClientId: GOOGLE_WEB_CLIENT_ID,
      iOSClientId: GOOGLE_IOS_CLIENT_ID,
      iOSServerClientId: GOOGLE_WEB_CLIENT_ID,
      mode: 'online',
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
/**
 * One pass of: generate fresh nonce → Google login → Supabase exchange.
 * Returns the Supabase result so the caller can decide whether to retry.
 */
async function attemptGoogleSignIn(): Promise<{
  success: boolean;
  cancelled?: boolean;
  error?: string;
  nonceError?: boolean;
}> {
  const rawNonce = randomString();
  const hashedNonce = await sha256Hex(rawNonce);

  const loginResult = await SocialLogin.login({
    provider: 'google',
    options: {
      nonce: hashedNonce,
    },
  });

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
    // Detect the known iOS cached-token nonce mismatch error so the caller
    // can clear Google's SDK cache and retry. Match on substring because
    // Supabase's exact error text may evolve.
    const msg = (error.message || '').toLowerCase();
    const isNonceError =
      msg.includes('nonce') &&
      (msg.includes('id_token') || msg.includes('id token') || msg.includes('mismatch'));
    console.error('[GoogleSignIn] Supabase signInWithIdToken failed', error);
    return {
      success: false,
      error: `Supabase: ${error.message}`,
      nonceError: isNonceError,
    };
  }

  return { success: true };
}

export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  if (!Capacitor.isNativePlatform()) {
    return { success: false, notNative: true };
  }

  try {
    await ensureGoogleInitialized();

    // First attempt
    const first = await attemptGoogleSignIn();
    if (first.success) return { success: true };

    if (!first.nonceError) {
      return { success: false, error: first.error };
    }

    // Nonce mismatch — iOS Google SDK returned a cached token with stale or
    // missing nonce. Clear the cache by logging out from Google, then retry
    // once. Per Capgo's documented Supabase iOS Google integration pattern.
    console.warn('[GoogleSignIn] Nonce mismatch — clearing Google cache and retrying');
    try {
      await SocialLogin.logout({ provider: 'google' });
    } catch (logoutErr) {
      console.warn('[GoogleSignIn] Google logout before retry failed (continuing)', logoutErr);
    }

    const second = await attemptGoogleSignIn();
    if (second.success) return { success: true };
    return { success: false, error: second.error };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const code = (err as { code?: string | number })?.code;
    const name = (err as { name?: string })?.name;
    const cause = (err as { cause?: unknown })?.cause;
    const stack = (err as { stack?: string })?.stack;
    console.error('[GoogleSignIn] caught', { name, code, message, cause, stack });
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
