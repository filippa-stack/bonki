import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

const PARTNER_LEFT_TYPES = ['partner_left_space', 'member_left', 'partner_removed', 'partner_switched'] as const;
type PartnerLeftType = typeof PARTNER_LEFT_TYPES[number];

const gateKey = (spaceId: string) => `partner_left_seen_${spaceId}`;

export interface PartnerLeftDetectorResult {
  shouldShow: boolean;
  eventType: PartnerLeftType | null;
  markSeen: () => void;
}

/**
 * Always-running detector hook for partner-left events.
 * Sets shouldShow=true when a relevant system_event is detected for the space,
 * gated by a one-time localStorage key so it only fires once per space.
 *
 * Never renders any UI — purely detection logic.
 */
export function usePartnerLeftDetector(
  spaceId: string | null,
  userId: string | null,
): PartnerLeftDetectorResult {
  const [shouldShow, setShouldShow] = useState(false);
  const [eventType, setEventType] = useState<PartnerLeftType | null>(null);
  const triggeredRef = useRef(false);

  const trigger = useCallback((type: string) => {
    if (triggeredRef.current) return;
    triggeredRef.current = true;
    setEventType((type as PartnerLeftType) ?? 'partner_left_space');
    setShouldShow(true);
  }, []);

  const markSeen = useCallback(() => {
    if (spaceId) localStorage.setItem(gateKey(spaceId), '1');
    setShouldShow(false);
  }, [spaceId]);

  useEffect(() => {
    if (!spaceId || !userId) return;
    // Already seen for this space
    if (localStorage.getItem(gateKey(spaceId))) return;

    let cancelled = false;

    const checkExisting = async () => {
      const { data } = await supabase
        .from('system_events')
        .select('id, type, payload')
        .eq('couple_space_id', spaceId)
        .in('type', PARTNER_LEFT_TYPES)
        .limit(10);

      if (cancelled || !data || data.length === 0) return;

      const partnerEvent = data.find((row) => {
        const payload = row.payload as Record<string, unknown> | null;
        const actorId = payload?.user_id ?? payload?.actor_user_id;
        return actorId !== userId;
      });

      if (partnerEvent) trigger(partnerEvent.type);
    };

    checkExisting();

    const channel = supabase
      .channel(`partner-left-detector-${spaceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'system_events',
          filter: `couple_space_id=eq.${spaceId}`,
        },
        (payload: any) => {
          const type: string = payload.new?.type || '';
          const actorId = payload.new?.payload?.user_id || payload.new?.payload?.actor_user_id;
          if (actorId === userId) return;
          if ((PARTNER_LEFT_TYPES as readonly string[]).includes(type)) {
            trigger(type);
          }
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [spaceId, userId, trigger]);

  return { shouldShow, eventType, markSeen };
}
