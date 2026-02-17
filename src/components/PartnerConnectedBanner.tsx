import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext as useCoupleSpace } from '@/contexts/CoupleSpaceContext';
import { supabase } from '@/integrations/supabase/client';

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

  // Mark as seen on first show so it doesn't reappear
  useEffect(() => {
    if (visible && space) {
      localStorage.setItem(SEEN_KEY, space.id);
    }
  }, [visible, space]);

  if (!visible) return null;

  return (
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
  );
}
