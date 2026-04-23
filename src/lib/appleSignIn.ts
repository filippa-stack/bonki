import { Capacitor } from '@capacitor/core';
import { SocialLogin } from '@capgo/capacitor-social-login';
import { supabase } from '@/integrations/supabase/client';

export interface AppleSignInResult {
  success: boolean;
  cancelled?: boolean;
  error?: string;
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
    return { success: false, error: 'Not a native platform' };
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
      return { success: false, error: 'No identity token' };
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: identityToken,
      nonce,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const code = (err as { code?: string | number })?.code;
    const haystack = `${code ?? ''} ${message}`.toLowerCase();
    if (haystack.includes('1001') || haystack.includes('canceled') || haystack.includes('cancelled')) {
      return { success: false, cancelled: true };
    }
    return { success: false, error: message || 'Unknown error' };
  }
}
