import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpace } from '@/hooks/useCoupleSpace';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const SEEN_KEY = 'partner_left_seen';

interface Props {
  onInvite: () => void;
  /** Called when partner_left_space is detected — clears session/journey in AppContext */
  onPartnerLeft: () => void;
}

export default function PartnerLeftBanner({ onInvite, onPartnerLeft }: Props) {
  const { user } = useAuth();
  const { space, refreshSpace } = useCoupleSpace();
  const [visible, setVisible] = useState(false);
  const [hasTriggeredClear, setHasTriggeredClear] = useState(false);

  const handleDetected = useCallback(() => {
    setVisible(true);
    if (!hasTriggeredClear) {
      setHasTriggeredClear(true);
      onPartnerLeft();
      // Refresh space to update memberCount → triggers solo mode
      refreshSpace();
    }
  }, [hasTriggeredClear, onPartnerLeft, refreshSpace]);

  useEffect(() => {
    if (!user || !space) return;

    const seen = localStorage.getItem(SEEN_KEY);
    if (seen === space.id) return;

    const checkExisting = async () => {
      const { data } = await supabase
        .from('system_events')
        .select('id')
        .eq('couple_space_id', space.id)
        .eq('type', 'partner_left_space')
        .limit(1);

      if (data && (data as any[]).length > 0) {
        handleDetected();
      }
    };

    checkExisting();

    const channel = supabase
      .channel(`partner_left_${space.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'system_events',
          filter: `couple_space_id=eq.${space.id}`,
        },
        (payload: any) => {
          if (payload.new?.type === 'partner_left_space') {
            handleDetected();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, space, handleDetected]);

  const dismiss = () => {
    if (space) localStorage.setItem(SEEN_KEY, space.id);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-6 mt-4 mb-2 rounded-2xl border border-border bg-card p-5 text-center space-y-3"
    >
      <p className="font-serif text-foreground text-base">
        Det här utrymmet är nu bara ditt.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Din partner har lämnat det här utrymmet. Du kan fortsätta själv eller bjuda in någon ny.
      </p>
      <div className="flex gap-3 pt-1">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-muted-foreground"
          onClick={dismiss}
        >
          OK
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={() => {
            dismiss();
            onInvite();
          }}
        >
          Bjud in
        </Button>
      </div>
    </motion.div>
  );
}
