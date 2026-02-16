import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpace } from '@/hooks/useCoupleSpace';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

const SEEN_KEY = 'partner_connected_seen';

export default function PartnerConnectedBanner() {
  const { user } = useAuth();
  const { space } = useCoupleSpace();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!user || !space) return;

    // Already seen for this space
    const seen = localStorage.getItem(SEEN_KEY);
    if (seen === space.id) return;

    // Check if a partner_joined event already exists
    const checkExisting = async () => {
      const { data } = await supabase
        .from('system_events' as any)
        .select('id')
        .eq('couple_space_id', space.id)
        .eq('type', 'partner_joined')
        .limit(1);

      if (data && (data as any[]).length > 0) {
        setVisible(true);
      }
    };

    checkExisting();

    // Subscribe for realtime events
    const channel = supabase
      .channel(`system_events_${space.id}`)
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
            setVisible(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, space]);

  const dismiss = () => {
    if (space) localStorage.setItem(SEEN_KEY, space.id);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="px-6 mb-6"
        >
          <div className="rounded-2xl border border-accent/30 bg-card p-6 text-center space-y-4">
            <div className="flex justify-center">
              <Heart className="h-6 w-6 text-accent" />
            </div>
            <h2 className="font-serif text-lg text-foreground">
              Din partner har anslutit 🎉
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
              Nu kan ni dela reflektioner med varandra. Inget delas utan att du själv väljer att dela.
            </p>
            <Button
              onClick={dismiss}
              size="sm"
            >
              Okej
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
