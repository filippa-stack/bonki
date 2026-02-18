import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext as useCoupleSpace } from '@/contexts/CoupleSpaceContext';
import { supabase } from '@/integrations/supabase/client';

import { BEAT_2, EASE } from '@/lib/motion';

const getSeenKey = (spaceId: string) => `partner_connected_seen_${spaceId}`;

interface Props {
  /** Space id used for the seen-key — passed from Home to avoid re-reading context */
  spaceId?: string;
  /** Called once when this banner becomes visible, so Home can mark it seen in priority queue */
  onSeen?: () => void;
}

export default function PartnerConnectedBanner({ spaceId, onSeen }: Props) {
  const { user } = useAuth();
  const { space, userRole } = useCoupleSpace();
  const [visible, setVisible] = useState(false);

  // Use prop spaceId if provided, else fall back to context space.id
  const resolvedSpaceId = spaceId ?? space?.id;

  const markVisible = () => {
    setVisible(true);
    onSeen?.();
  };

  useEffect(() => {
    if (!user || !resolvedSpaceId) return;

    // Only show for the inviter (partner_a). The joiner (partner_b) sees JustJoinedBanner.
    if (userRole !== 'partner_a') return;

    const seen = localStorage.getItem(getSeenKey(resolvedSpaceId));
    if (seen === 'true') return;

    const checkExisting = async () => {
      const { data } = await supabase
        .from('system_events' as any)
        .select('id, payload')
        .eq('couple_space_id', resolvedSpaceId)
        .eq('type', 'partner_joined')
        .limit(1);

      if (data && (data as any[]).length > 0) {
        // Ensure it wasn't triggered by the current user themselves
        const event = (data as any[])[0];
        if (event.payload?.joining_user_id === user.id) return;
        markVisible();
      }
    };

    checkExisting();

    const channel = supabase
      .channel(`system_events_partner_${resolvedSpaceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'system_events',
          filter: `couple_space_id=eq.${resolvedSpaceId}`,
        },
        (payload: any) => {
          if (payload.new?.type === 'partner_joined') {
            // Skip if current user is the one who joined
            if (payload.new?.payload?.joining_user_id === user.id) return;
            markVisible();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, resolvedSpaceId, userRole]);

  useEffect(() => {
    if (visible && resolvedSpaceId) {
      localStorage.setItem(getSeenKey(resolvedSpaceId), 'true');
    }
  }, [visible, resolvedSpaceId]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: BEAT_2, ease: EASE }}
          className="overflow-hidden"
        >
          <div className="flex items-center justify-center gap-2 mt-[12px] mb-[16px] px-6">
            <p className="text-[13px] text-muted-foreground/50 text-center">
              🤍 Ni är nu ihopkopplade.
            </p>
            <button
              onClick={() => setVisible(false)}
              className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
