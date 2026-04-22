import { Capacitor } from '@capacitor/core';
import { SignInWithApple, SignInWithAppleOptions } from '@capacitor-community/apple-sign-in';
import { supabase } from '@/integrations/supabase/client';

export interface AppleSignInResult {
  success: boolean;
  cancelled?: boolean;
  error?: string;
}

function randomString(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

/**
 * Native iOS Sign in with Apple via Capacitor plugin.
 * On web, returns a no-op — callers should use Lovable OAuth instead.
 */
export async function signInWithApple(): Promise<AppleSignInResult> {
  if (!Capacitor.isNativePlatform()) {
    return { success: false, error: 'Not a native platform' };
  }

  const nonce = randomString();
  const state = randomString();

  const options: SignInWithAppleOptions = {
    clientId: 'com.bonkistudio.bonkiapp',
    redirectURI: 'https://spgknasuinxmvyrlpztx.supabase.co/auth/v1/callback',
    scopes: 'email name',
    state,
    nonce,
  };

  try {
    const result = await SignInWithApple.authorize(options);
    const identityToken = result?.response?.identityToken;

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
