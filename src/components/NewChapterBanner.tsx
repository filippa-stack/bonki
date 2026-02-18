import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext as useCoupleSpace } from '@/contexts/CoupleSpaceContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const gateKey = (spaceId: string, eventId: string) =>
  `new_space_created_seen_${spaceId}_${eventId}`;

export default function NewChapterBanner() {
  const { user } = useAuth();
  const { space } = useCoupleSpace();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [triggered, setTriggered] = useState(false);

  const handleDetected = useCallback((eventId: string, actorUserId: string) => {
    if (!user || !space) return;
    // Receiver-only: ignore if current user is the actor
    if (actorUserId === user.id) return;
    // One-time gate per event id
    if (localStorage.getItem(gateKey(space.id, eventId))) return;
    if (triggered) return;

    setTriggered(true);
    localStorage.setItem(gateKey(space.id, eventId), '1');
    setVisible(true);
  }, [user, space, triggered]);

  useEffect(() => {
    if (!user || !space) return;

    // Check for existing event on mount (e.g. app reopen)
    const checkExisting = async () => {
      const { data } = await supabase
        .from('system_events')
        .select('id, payload')
        .eq('couple_space_id', space.id)
        .eq('type', 'new_space_created')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!data || data.length === 0) return;

      for (const row of data) {
        const payload = row.payload as Record<string, unknown> | null;
        const actorId = (payload?.actor_user_id ?? '') as string;
        if (actorId && !localStorage.getItem(gateKey(space.id, row.id))) {
          handleDetected(row.id, actorId);
          return;
        }
      }
    };

    checkExisting();

    // Realtime subscription
    const channel = supabase
      .channel(`new-chapter-${space.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'system_events',
          filter: `couple_space_id=eq.${space.id}`,
        },
        (payload: any) => {
          if (payload.new?.type !== 'new_space_created') return;
          const actorId = (payload.new?.payload?.actor_user_id ?? '') as string;
          handleDetected(payload.new.id, actorId);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, space, handleDetected]);

  const EASE = [0.4, 0.0, 0.2, 1] as const;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -12, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{
            opacity: { duration: 0.14, ease: EASE },
            y: { duration: 0.14, ease: EASE },
            height: { duration: 0.16, ease: EASE },
          }}
          className="overflow-hidden mx-6"
        >
          <div className="rounded-[20px] border border-border bg-card p-6 space-y-3 shadow-[0_1px_4px_0_hsl(0_0%_0%/0.04)]">
            <p className="font-serif text-foreground text-base">
              Ett nytt kapitel startades.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Din partner skapade ett nytt utrymme. Ni fortsätter där.
            </p>
            <div className="flex gap-3 pt-1">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-muted-foreground"
                onClick={() => setVisible(false)}
              >
                Stäng
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => {
                  setVisible(false);
                  navigate('/', { replace: true });
                }}
              >
                Gå till hem
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
