import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SliderCheckIn from '@/components/still-us/SliderCheckIn';
import { CARD_SEQUENCE } from '@/data/stillUsSequence';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function CheckInPage() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const { space } = useCoupleSpaceContext();
  const { user } = useAuth();

  const card = CARD_SEQUENCE.find(c => c.cardId === cardId);
  const cardIndex = card?.index ?? 0;

  // Derive hasSeenFormatPreview from onboarding_events
  const [hasSeenFormatPreview, setHasSeenFormatPreview] = useState(true); // default true to avoid flash
  const [hasPartner, setHasPartner] = useState(false);
  const [partnerCompleted, setPartnerCompleted] = useState(false);

  useEffect(() => {
    if (!user?.id || !space?.id) return;

    // Check format preview seen
    (async () => {
      const { data } = await supabase
        .from('onboarding_events')
        .select('id')
        .eq('user_id', user.id)
        .eq('event_type', 'format_preview_seen')
        .limit(1);
      setHasSeenFormatPreview((data && data.length > 0) ?? false);
    })();

    // Check partner linked
    (async () => {
      const { data } = await supabase
        .from('couple_members')
        .select('user_id')
        .eq('couple_space_id', space.id)
        .is('left_at', null);
      const members = data ?? [];
      const partnerExists = members.length > 1;
      setHasPartner(partnerExists);

      // Check if partner already completed slider for this card
      if (partnerExists) {
        const partnerId = members.find(m => m.user_id !== user.id)?.user_id;
        if (partnerId) {
          const { data: cardState } = await supabase
            .from('user_card_state')
            .select('slider_completed_at')
            .eq('couple_id', space.id)
            .eq('user_id', partnerId)
            .eq('card_id', cardId ?? '')
            .maybeSingle();
          setPartnerCompleted(!!cardState?.slider_completed_at);
        }
      }
    })();
  }, [user?.id, space?.id, cardId]);

  return (
    <SliderCheckIn
      cardIndex={cardIndex}
      cardId={cardId}
      coupleId={space?.id}
      hasSeenFormatPreview={hasSeenFormatPreview}
      hasPartner={hasPartner}
      partnerCompleted={partnerCompleted}
      onBack={() => navigate(-1)}
    />
  );
}
