import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext as useCoupleSpace } from '@/contexts/CoupleSpaceContext';
import { supabase } from '@/integrations/supabase/client';

import { BEAT_2, EASE } from '@/lib/motion';

const SEEN_KEY = 'partner_connected_seen';

export default function PartnerConnectedBanner() {
  const { user } = useAuth();
  const { space, userRole } = useCoupleSpace();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!user || !space) return;

    // Only show for the inviter (partner_a). The joiner (partner_b) sees JustJoinedBanner.
    if (userRole !== 'partner_a') return;

    const seen = localStorage.getItem(SEEN_KEY);
    if (seen === space.id) return;

    const checkExisting = async () => {
      const { data } = await supabase
        .from('system_events' as any)
        .select('id, payload')
        .eq('couple_space_id', space.id)
        .eq('type', 'partner_joined')
        .limit(1);

      if (data && (data as any[]).length > 0) {
        // Ensure it wasn't triggered by the current user themselves
        const event = (data as any[])[0];
        if (event.payload?.joining_user_id === user.id) return;
        setVisible(true);
      }
    };

    checkExisting();

    const channel = supabase
      .channel(`system_events_partner_${space.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'system_events',
          filter: `couple_space_id=eq.${space.id}`,
        },
        (payload: any) => {
          if (payload.new?.type === 'partner_joined') {
            // Skip if current user is the one who joined
            if (payload.new?.payload?.joining_user_id === user.id) return;
            setVisible(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, space, userRole]);

  useEffect(() => {
    if (visible && space) {
      localStorage.setItem(SEEN_KEY, space.id);
    }
  }, [visible, space]);

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
