// SESSION MODEL LOCK:
// Do NOT use couple_progress.current_session.
// The JSON session model is deprecated.
// All session state must come from normalized tables.

import { useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext as useCoupleSpace } from '@/contexts/CoupleSpaceContext';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { toast } from 'sonner';

const DEDUPE_WINDOW_MS = 10_000;

/**
 * Listens for partner activity and shows calm in-app notifications.
 * - Shared reflections: when partner shares a new note
 * - Conversation progress: when partner resumes after a long pause (opt-in)
 */
export function usePartnerNotifications() {
  return; // Disabled: single shared account model
  const { user } = useAuth();
  const { space } = useCoupleSpace();
  const { prefs } = useNotificationPreferences();
  const { t } = useTranslation();
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;

  // Dedupe: track last shown timestamp per event type
  const lastShownRef = useRef<Record<string, number>>({});
  const lastToastIdRef = useRef<string | number | undefined>(undefined);

  const showDedupedToast = useCallback((key: string, message: string, description: string) => {
    const now = Date.now();
    const lastShown = lastShownRef.current[key] || 0;
    if (now - lastShown < DEDUPE_WINDOW_MS) return;
    lastShownRef.current[key] = now;

    // Dismiss only our own previous notification toast
    if (lastToastIdRef.current !== undefined) {
      toast.dismiss(lastToastIdRef.current);
    }
    const id = toast(message, { description, duration: 2500 });
    lastToastIdRef.current = id;
  }, []);

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

          showDedupedToast(
            'partner_shared',
            t('notifications.partner_shared'),
            t('notifications.partner_shared_hint'),
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, space, t, showDedupedToast]);

  // Listen for partner's conversation progress via couple_sessions
  useEffect(() => {
    if (!user || !space) return;

    const channel = supabase
      .channel(`partner_progress_notify_${space.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'couple_sessions',
          filter: `couple_space_id=eq.${space.id}`,
        },
        (payload) => {
          const row = payload.new as any;
          if (!row) return;
          // Only notify for active sessions started by partner
          if (row.created_by === user.id) return;
          if (row.status !== 'active') return;
          if (!prefsRef.current.notifyConversationProgress) return;

          showDedupedToast(
            'partner_continuing',
            t('notifications.partner_continuing'),
            t('notifications.partner_continuing_hint'),
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, space, t, showDedupedToast]);
}
