import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpace } from '@/hooks/useCoupleSpace';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { toast } from 'sonner';

/**
 * Listens for partner activity and shows calm in-app notifications.
 * - Shared reflections: when partner shares a new note
 * - Conversation progress: when partner resumes after a long pause (opt-in)
 */
export function usePartnerNotifications() {
  const { user } = useAuth();
  const { space } = useCoupleSpace();
  const { prefs } = useNotificationPreferences();
  const { t } = useTranslation();
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;

  // Listen for partner's shared reflections
  useEffect(() => {
    if (!user || !space) return;

    const channel = supabase
      .channel(`partner_notes_${space.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'prompt_notes',
          filter: `couple_space_id=eq.${space.id}`,
        },
        (payload) => {
          const row = payload.new as any;
          if (!row) return;
          // Only notify for shared notes from partner
          if (row.user_id === user.id) return;
          if (row.visibility !== 'shared') return;
          if (!prefsRef.current.notifySharedReflection) return;

          toast(t('notifications.partner_shared'), {
            description: t('notifications.partner_shared_hint'),
            duration: 5000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, space, t]);

  // Listen for partner's conversation progress (after pause)
  useEffect(() => {
    if (!user || !space) return;

    const channel = supabase
      .channel(`partner_progress_notify_${space.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'couple_progress',
          filter: `couple_space_id=eq.${space.id}`,
        },
        (payload) => {
          const row = payload.new as any;
          if (!row) return;
          if (row.updated_by === user.id) return;
          if (!prefsRef.current.notifyConversationProgress) return;

          // Only notify if there's an active session (partner started/resumed)
          if (!row.current_session) return;

          toast(t('notifications.partner_continuing'), {
            description: t('notifications.partner_continuing_hint'),
            duration: 5000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, space, t]);
}
