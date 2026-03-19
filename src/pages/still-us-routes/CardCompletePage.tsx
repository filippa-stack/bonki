import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import CardComplete from '@/components/still-us/CardComplete';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cardIdFromSlug, cardIndexFromSlug, COLORS } from '@/lib/stillUsTokens';

export default function CardCompletePage() {
  const { cardId: slug } = useParams<{ cardId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [props, setProps] = useState<{
    coupleId: string;
    deviceId: string;
    partnerName: string;
    partnerTier: string;
  } | null>(null);

  const backendCardId = slug ? cardIdFromSlug(slug) : null;
  const cardIndex = slug ? cardIndexFromSlug(slug) : -1;

  // Card 22 guard at page level too
  useEffect(() => {
    if (cardIndex === 21) {
      navigate('/ceremony', { replace: true });
    }
  }, [cardIndex, navigate]);

  useEffect(() => {
    if (!user?.id || !slug) return;

    const load = async () => {
      const { data: cs } = await supabase
        .from('couple_state')
        .select('couple_id, initiator_id, partner_id, partner_tier, tier_2_partner_name')
        .or(`initiator_id.eq.${user.id},partner_id.eq.${user.id}`)
        .maybeSingle();

      if (!cs) {
        navigate('/', { replace: true });
        return;
      }

      let partnerName = 'din partner';
      if (cs.partner_tier === 'tier_2' && cs.tier_2_partner_name) {
        partnerName = cs.tier_2_partner_name;
      } else if (cs.partner_id && cs.partner_id !== user.id) {
        const { data: space } = await supabase
          .from('couple_spaces_safe')
          .select('partner_a_name, partner_b_name')
          .limit(1)
          .maybeSingle();
        if (space) {
          partnerName = (cs.initiator_id === user.id
            ? space.partner_b_name
            : space.partner_a_name) || 'din partner';
        }
      }

      let deviceId = localStorage.getItem('still_us_device_id');
      if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem('still_us_device_id', deviceId);
      }

      setProps({
        coupleId: cs.couple_id,
        deviceId,
        partnerName,
        partnerTier: cs.partner_tier,
      });
    };

    load();
  }, [user?.id, slug, navigate]);

  if (cardIndex === 21) return null;

  if (!props || !backendCardId || !slug) {
    return (
      <div style={{
        minHeight: '100dvh',
        backgroundColor: COLORS.emberNight,
      }} />
    );
  }

  return (
    <CardComplete
      slug={slug}
      cardIndex={cardIndex}
      cardTitle=""
      coupleId={props.coupleId}
      deviceId={props.deviceId}
      partnerName={props.partnerName}
      partnerTier={props.partnerTier}
    />
  );
}
