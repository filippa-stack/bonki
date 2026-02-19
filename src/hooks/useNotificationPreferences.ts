import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface NotificationPreferences {
  notifySharedReflection: boolean;
  notifyConversationProgress: boolean;
}

const defaults: NotificationPreferences = {
  notifySharedReflection: true,
  notifyConversationProgress: false,
};

const LEGACY_KEY = 'stillus-notification-prefs';

function mapRowToPrefs(row: any): NotificationPreferences {
  return {
    notifySharedReflection: row.notify_shared_reflection ?? defaults.notifySharedReflection,
    notifyConversationProgress: row.notify_conversation_progress ?? defaults.notifyConversationProgress,
  };
}

export function useNotificationPreferences() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPreferences>(defaults);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (!user) {
      setPrefs(defaults);
      setLoading(false);
      initialized.current = false;
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);

      let legacyPrefs: Partial<NotificationPreferences> | null = null;
      try {
        const raw = localStorage.getItem(LEGACY_KEY);
        if (raw) {
          legacyPrefs = JSON.parse(raw);
          localStorage.removeItem(LEGACY_KEY);
        }
      } catch { /* ignore */ }

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (cancelled) return;

      if (data && !error) {
        setPrefs(mapRowToPrefs(data));
      } else {
        const merged = { ...defaults, ...legacyPrefs };
        const { data: inserted } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: user.id,
            notify_shared_reflection: merged.notifySharedReflection,
            notify_conversation_progress: merged.notifyConversationProgress,
            notify_email_proposal: false,
          })
          .select('*')
          .single();

        if (!cancelled && inserted) {
          setPrefs(mapRowToPrefs(inserted));
        }
      }

      initialized.current = true;
      if (!cancelled) setLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, [user]);

  const updatePref = useCallback(<K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K],
  ) => {
    if (!user || !initialized.current) return;

    setPrefs(prev => ({ ...prev, [key]: value }));

    const colMap: Record<keyof NotificationPreferences, string> = {
      notifySharedReflection: 'notify_shared_reflection',
      notifyConversationProgress: 'notify_conversation_progress',
    };

    supabase
      .from('notification_preferences')
      .update({ [colMap[key]]: value, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .then();
  }, [user]);

  return { prefs, loading, updatePref };
}
