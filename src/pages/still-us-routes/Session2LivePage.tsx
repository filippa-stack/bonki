import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import SessionTwoLive from '@/components/still-us/SessionTwoLive';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cardIdFromSlug, cardIndexFromSlug, COLORS } from '@/lib/stillUsTokens';
import { getSliderSetBySlug } from '@/data/sliderPrompts';
import { getSessionContent } from '@/data/sessionQuestions';

export default function Session2LivePage() {
  const { cardId: slug } = useParams<{ cardId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [props, setProps] = useState<{
    coupleId: string;
    deviceId: string;
    partnerTier: string;
  } | null>(null);

  const backendCardId = slug ? cardIdFromSlug(slug) : null;
  const cardIndex = slug ? cardIndexFromSlug(slug) : -1;
  const sliderSet = slug ? getSliderSetBySlug(slug) : undefined;

  useEffect(() => {
    if (!user?.id || !slug) return;

    const load = async () => {
      const { data: cs } = await supabase
        .from('couple_state')
        .select('couple_id, partner_tier')
        .or(`initiator_id.eq.${user.id},partner_id.eq.${user.id}`)
        .maybeSingle();

      if (!cs) {
        navigate('/', { replace: true });
        return;
      }

      let deviceId = localStorage.getItem('still_us_device_id');
      if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem('still_us_device_id', deviceId);
      }

      setProps({
        coupleId: cs.couple_id,
        deviceId,
        partnerTier: cs.partner_tier,
      });
    };

    load();
  }, [user?.id, slug, navigate]);

  if (!props || !backendCardId || !slug) {
    return (
      <div style={{
        minHeight: '100dvh',
        backgroundColor: COLORS.emberNight,
      }} />
    );
  }

  // Authored Vänd Q2 from content data
  const sessionContent = getSessionContent(cardIndex);
  const vandQuestion = sessionContent?.vand2?.text ?? sessionContent?.vand1?.text ?? 'Vad var det viktigaste ni pratade om?';
  const vandAnchor = sessionContent?.vand2?.anchor;

  return (
    <SessionTwoLive
      slug={slug}
      coupleId={props.coupleId}
      cardId={backendCardId}
      cardIndex={cardIndex}
      cardTitle={sliderSet?.cardTitle ?? ''}
      deviceId={props.deviceId}
      partnerTier={props.partnerTier}
      vandQuestion={vandQuestion}
    />
  );
}
