import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

const gateKey = (spaceId: string, eventId: string) =>
  `new_space_created_seen_${spaceId}_${eventId}`;

export interface NewChapterDetectorResult {
  shouldShow: boolean;
  markSeen: () => void;
}

/**
 * Always-running detector hook for new_space_created events.
 * Sets shouldShow=true when a relevant system_event is detected for the space,
 * gated per event ID via localStorage.
 *
 * Never renders any UI — purely detection logic.
 */
export function useNewChapterDetector(
  spaceId: string | null,
  userId: string | null,
): NewChapterDetectorResult {
  const [shouldShow, setShouldShow] = useState(false);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const triggeredRef = useRef(false);

  const trigger = useCallback((eventId: string, actorUserId: string) => {
    if (!spaceId) return;
    if (actorUserId === userId) return;
    if (localStorage.getItem(gateKey(spaceId, eventId))) return;
    if (triggeredRef.current) return;

    triggeredRef.current = true;
    localStorage.setItem(gateKey(spaceId, eventId), '1');
    setActiveEventId(eventId);
    setShouldShow(true);
  }, [spaceId, userId]);

  const markSeen = useCallback(() => {
    setShouldShow(false);
    // localStorage already written in trigger
  }, []);

  useEffect(() => {
    if (!spaceId || !userId) return;
    let cancelled = false;

    const checkExisting = async () => {
      const { data } = await supabase
        .from('system_events')
        .select('id, payload')
        .eq('couple_space_id', spaceId)
        .eq('type', 'new_space_created')
        .order('created_at', { ascending: false })
        .limit(5);

      if (cancelled || !data || data.length === 0) return;

      for (const row of data) {
        const payload = row.payload as Record<string, unknown> | null;
        const actorId = (payload?.actor_user_id ?? '') as string;
        if (actorId && !localStorage.getItem(gateKey(spaceId, row.id))) {
          trigger(row.id, actorId);
          return;
        }
      }
    };

    checkExisting();

    const channel = supabase
      .channel(`new-chapter-detector-${spaceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'system_events',
          filter: `couple_space_id=eq.${spaceId}`,
        },
        (payload: any) => {
          if (payload.new?.type !== 'new_space_created') return;
          const actorId = (payload.new?.payload?.actor_user_id ?? '') as string;
          trigger(payload.new.id, actorId);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [spaceId, userId, trigger]);

  return { shouldShow, markSeen };
}
