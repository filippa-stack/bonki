import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SliderCheckIn from '@/components/still-us/SliderCheckIn';
import { CARD_SEQUENCE } from '@/data/stillUsSequence';
import { cardIdFromSlug } from '@/lib/stillUsTokens';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function CheckInPage() {
  const { cardId: slug } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const { space } = useCoupleSpaceContext();
  const { user } = useAuth();

  const card = CARD_SEQUENCE.find(c => c.cardId === slug);
  const cardIndex = card?.index ?? 0;

  // Convert slug to backend card_N format for RPC calls
  const backendCardId = cardIdFromSlug(slug ?? '') ?? `card_${cardIndex + 1}`;

  // Derive hasSeenFormatPreview from onboarding_events
  const [hasSeenFormatPreview, setHasSeenFormatPreview] = useState(true); // default true to avoid flash
  const [hasPartner, setHasPartner] = useState(false);
  const [partnerCompleted, setPartnerCompleted] = useState(false);
  const [realCoupleId, setRealCoupleId] = useState<string | undefined>();

  useEffect(() => {
    if (!user?.id) return;

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

    // Fetch real couple_id from couple_state (NOT couple_spaces.id)
    (async () => {
      const { data: cs } = await supabase
        .from('couple_state')
        .select('couple_id, partner_id, partner_tier')
        .or(`initiator_id.eq.${user.id},partner_id.eq.${user.id}`)
        .is('dissolved_at', null)
        .maybeSingle();

      if (!cs) return;

      setRealCoupleId(cs.couple_id);
      const partnerExists = !!(cs.partner_id || cs.partner_tier === 'tier_2');
      setHasPartner(partnerExists);

      // Check if partner already completed slider for this card
      if (partnerExists && cs.partner_id) {
        const { data: cardState } = await supabase
          .from('user_card_state')
          .select('slider_completed_at')
          .eq('couple_id', cs.couple_id)
          .eq('user_id', cs.partner_id)
          .eq('card_id', backendCardId)
          .maybeSingle();
        setPartnerCompleted(!!cardState?.slider_completed_at);
      }
    })();
  }, [user?.id, slug, backendCardId]);

  return (
    <SliderCheckIn
      cardIndex={cardIndex}
      cardId={backendCardId}
      slug={slug ?? ''}
      coupleId={realCoupleId}
      hasSeenFormatPreview={hasSeenFormatPreview}
      hasPartner={hasPartner}
      partnerCompleted={partnerCompleted}
      onBack={() => navigate('/product/still-us')}
    />
  );
}
