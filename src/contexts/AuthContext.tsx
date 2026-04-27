import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { trackPixelEvent } from '@/lib/metaPixel';
import { initRevenueCat, logOutRevenueCat } from '@/lib/revenueCat';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function savePendingLegalConsent(userId: string) {
  const raw = localStorage.getItem('pending-legal-consent');
  if (!raw) return;

  try {
    const legal = JSON.parse(raw);

    // Upsert: if user_settings exists, update legal field; otherwise it will be set when settings sync creates the row.
    // We need to check if a row exists first.
    const { data: existing } = await supabase
      .from('user_settings')
      .select('id, site_settings')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      // Merge legal into site_settings JSONB
      const currentSiteSettings = (existing.site_settings as Record<string, unknown>) || {};
      await supabase
        .from('user_settings')
        .update({
          site_settings: { ...currentSiteSettings, legal } as unknown as Json,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
    } else {
      // Row doesn't exist yet — store in localStorage for useSettingsSync to pick up
      // The sync hook will create the row; we store legal in a temporary key
      localStorage.setItem('pending-legal-consent-for-sync', raw);
    }

    localStorage.removeItem('pending-legal-consent');
  } catch (err) {
    console.error('Failed to save legal consent:', err);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let initialSessionResolved = false;

    // Safety net: if getSession() hangs (e.g. Lovable preview), release loading after 8s
    const authTimeout = setTimeout(() => {
      if (!initialSessionResolved) {
        console.warn('[AuthContext] getSession() timed out after 8s — releasing loading gate');
        initialSessionResolved = true;
        setLoading(false);
      }
    }, 8000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.info('[ACCESS-DIAG] AuthContext onAuthStateChange', {
          event,
          hasSession: !!session,
          userId: session?.user?.id,
          initialSessionResolved,
          ts: Date.now(),
        });
        setSession(session);
        setUser(session?.user ?? null);

        // Only release loading gate from here AFTER getSession has resolved,
        // so downstream hooks never see a premature null user.
        if (initialSessionResolved) {
          console.info('[ACCESS-DIAG] AuthContext loading flip', { from: true, to: false, source: 'onAuthStateChange' });
          setLoading(false);
        }

        // After sign-in, save any pending legal consent
        if (event === 'SIGNED_IN' && session?.user) {
          // Fire CompleteRegistration only for brand-new accounts (created < 60s ago)
          const createdAt = new Date(session.user.created_at).getTime();
          if (Date.now() - createdAt < 60_000) {
            trackPixelEvent('CompleteRegistration');
          }
          savePendingLegalConsent(session.user.id);
          // Initialize RevenueCat (no-op on web; iOS-only for now)
          initRevenueCat(session.user.id);
        }
      }
    );

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        console.info('[ACCESS-DIAG] AuthContext getSession resolved', {
          hasSession: !!session,
          userId: session?.user?.id,
          ts: Date.now(),
        });
        initialSessionResolved = true;
        clearTimeout(authTimeout);
        setSession(session);
        setUser(session?.user ?? null);
        console.info('[ACCESS-DIAG] AuthContext loading flip', { from: true, to: false, source: 'getSession' });
        setLoading(false);
        // Cold-start init for already-authenticated users (SIGNED_IN won't fire)
        if (session?.user) {
          initRevenueCat(session.user.id);
        }
      })
      .catch((err) => {
        console.error("[AuthContext] getSession failed:", err);
        console.info('[ACCESS-DIAG] AuthContext getSession FAILED', { error: String(err) });
        initialSessionResolved = true;
        clearTimeout(authTimeout);
        setSession(null);
        setUser(null);
        setLoading(false);
      });

    return () => {
      subscription.unsubscribe();
      clearTimeout(authTimeout);
    };
  }, []);

  const signOut = async () => {
    await logOutRevenueCat();
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
