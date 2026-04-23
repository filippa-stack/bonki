import { Capacitor } from '@capacitor/core';
import { SocialLogin } from '@capgo/capacitor-social-login';
import { supabase } from '@/integrations/supabase/client';

export interface AppleSignInResult {
  success: boolean;
  cancelled?: boolean;
  notNative?: boolean;
  error?: string;
  errorCode?: string | number;
}

const APPLE_CLIENT_ID = 'com.bonkistudio.bonkiapp';

let appleInitialized = false;

async function ensureAppleInitialized() {
  if (appleInitialized) return;
  await SocialLogin.initialize({
    apple: {
      clientId: APPLE_CLIENT_ID,
    },
  });
  appleInitialized = true;
}

function randomString(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

/**
 * Native iOS Sign in with Apple via Capgo social-login plugin (Capacitor 8 compatible).
 * On web, returns a no-op — callers should use Lovable OAuth instead.
 */
export async function signInWithApple(): Promise<AppleSignInResult> {
  if (!Capacitor.isNativePlatform()) {
    // Not an error — caller should fall back to web OAuth.
    return { success: false, notNative: true };
  }

  const nonce = randomString();
  const state = randomString();

  try {
    await ensureAppleInitialized();

    const loginResult = await SocialLogin.login({
      provider: 'apple',
      options: {
        scopes: ['email', 'name'],
        nonce,
        state,
      },
    });

    // Capgo response shape: { provider: 'apple', result: { idToken, ... } }
    const result = (loginResult as unknown as { result?: { idToken?: string } })?.result;
    const identityToken = result?.idToken;

    if (!identityToken) {
      console.error('[AppleSignIn] No identity token returned from plugin', loginResult);
      return { success: false, error: 'Ingen identitetstoken mottagen från Apple.' };
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: identityToken,
      nonce,
    });

    if (error) {
      console.error('[AppleSignIn] Supabase signInWithIdToken failed', error);
      return { success: false, error: `Supabase: ${error.message}` };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const code = (err as { code?: string | number })?.code;
    const haystack = `${code ?? ''} ${message}`.toLowerCase();

    // Apple cancellation codes: 1001 (ASAuthorizationErrorCanceled)
    if (haystack.includes('1001') || haystack.includes('canceled') || haystack.includes('cancelled')) {
      return { success: false, cancelled: true };
    }

    console.error('[AppleSignIn] Native error', { code, message, err });
    // Surface the real native error so reviewers and devs can diagnose.
    const detail = code ? `[${code}] ${message}` : message;
    return { success: false, error: detail || 'Okänt fel från Apple.', errorCode: code };
  }
}
