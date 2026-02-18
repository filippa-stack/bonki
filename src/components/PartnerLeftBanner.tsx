import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext as useCoupleSpace } from '@/contexts/CoupleSpaceContext';
import { useNormalizedSessionContext } from '@/contexts/NormalizedSessionContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

// All event types that signal a partner disconnection — emitted by edge functions.
const PARTNER_LEFT_TYPES = ['partner_left_space', 'member_left', 'partner_removed'] as const;

// Gate key format: "still-us-partner-removed-<spaceId>"
const gateKey = (spaceId: string) => `partner_left_seen_${spaceId}`;

interface Props {
  /** Called once on detection — should call clearForPartnerLeave() in AppContext */
  onPartnerLeft: () => void;
  /** Scrolls to SoloInviteSection */
  onInvite: () => void;
}

export default function PartnerLeftBanner({ onPartnerLeft, onInvite }: Props) {
  const { user } = useAuth();
  const { space, refreshSpace } = useCoupleSpace();
  const normalizedSession = useNormalizedSessionContext();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [triggered, setTriggered] = useState(false);

  const handleDetected = useCallback(async (eventId?: string) => {
    if (triggered) return;
    setTriggered(true);

    // Write localStorage gate so the banner won't reappear for this space
    if (space) {
      localStorage.setItem(gateKey(space.id), eventId || '1');
    }

    // 1. Clear journey/session data in AppContext
    onPartnerLeft();

    // 2. Refresh couple space → memberCount drops → solo mode
    await refreshSpace();

    // 3. Refresh normalized session → clears active session snapshot
    //    so ActiveSessionGuard stops redirecting to the card route.
    await normalizedSession.refetch();

    // 4. Navigate home — exits any active card view
    navigate('/', { replace: true });

    // 5. Show calm banner
    setVisible(true);
  }, [triggered, space, onPartnerLeft, refreshSpace, normalizedSession, navigate]);

  useEffect(() => {
    if (!user || !space) return;

    // Don't re-show if already acknowledged for this space
    if (localStorage.getItem(gateKey(space.id))) return;

    // Check if an event already exists (e.g. app reopen after partner left)
    const checkExisting = async () => {
      const { data } = await supabase
        .from('system_events')
        .select('id, type, payload')
        .eq('couple_space_id', space.id)
        .in('type', PARTNER_LEFT_TYPES)
        .limit(10);

      if (!data || data.length === 0) return;

      // Only trigger for events NOT initiated by the current user
      const partnerEvent = data.find((row) => {
        const payload = row.payload as Record<string, unknown> | null;
        const actorId = payload?.user_id ?? payload?.actor_user_id;
        return actorId !== user.id;
      });

      if (partnerEvent) {
        handleDetected(partnerEvent.id);
      }
    };

    checkExisting();

    // Realtime subscription for live detection
    const channel = supabase
      .channel(`partner-left-${space.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'system_events',
          filter: `couple_space_id=eq.${space.id}`,
        },
        (payload: any) => {
          const type: string = payload.new?.type || '';
          // Only react to events triggered by the partner (not ourselves)
          const actorId = payload.new?.payload?.user_id || payload.new?.payload?.actor_user_id;
          if (actorId === user.id) return;

          if ((PARTNER_LEFT_TYPES as readonly string[]).includes(type)) {
            handleDetected(payload.new?.id);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, space, handleDetected]);

  const dismiss = () => setVisible(false);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mx-6 mt-4 mb-2 rounded-2xl border border-border bg-card p-5 space-y-3"
    >
      <p className="font-serif text-foreground text-base">
        Utrymmet är inte längre gemensamt
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Din partner har avslutat er koppling. Du kan fortsätta här själv eller bjuda in någon igen när det känns rätt.
      </p>
      <div className="flex gap-3 pt-1">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-muted-foreground"
          onClick={dismiss}
        >
          Stäng
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={() => {
            dismiss();
            onInvite();
          }}
        >
          Bjud in partner
        </Button>
      </div>
    </motion.div>
  );
}
