import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import SessionOneComplete from '@/components/still-us/SessionOneComplete';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cardIdFromSlug, cardIndexFromSlug } from '@/lib/stillUsTokens';

export default function Session1CompletePage() {
  const { cardId: slug } = useParams<{ cardId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coupleData, setCoupleData] = useState<{
    coupleId: string;
    partnerName: string;
    deviceId: string;
  } | null>(null);

  const backendCardId = slug ? cardIdFromSlug(slug) : null;

  useEffect(() => {
    if (!user?.id || !slug) return;

    const load = async () => {
      // Get couple_state
      const { data: cs } = await supabase
        .from('couple_state')
        .select('couple_id, initiator_id, partner_id, tier_2_partner_name, partner_tier')
        .or(`initiator_id.eq.${user.id},partner_id.eq.${user.id}`)
        .maybeSingle();

      if (!cs) {
        navigate('/?product=still-us', { replace: true });
        return;
      }

      // Determine partner name
      let partnerName = 'din partner';
      if (cs.partner_tier === 'tier_2' && cs.tier_2_partner_name) {
        partnerName = cs.tier_2_partner_name;
      } else if (cs.partner_id && cs.partner_id !== user.id) {
        // Try to get partner name from couple_spaces
        const { data: space } = await supabase
          .from('couple_spaces_safe')
          .select('partner_a_name, partner_b_name')
          .limit(1)
          .maybeSingle();
        if (space) {
          // Current user is initiator → partner is B, else A
          partnerName = (cs.initiator_id === user.id
            ? space.partner_b_name
            : space.partner_a_name) || 'din partner';
        }
      }

      // Get or create device_id
      let deviceId = localStorage.getItem('still_us_device_id');
      if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem('still_us_device_id', deviceId);
      }

      setCoupleData({
        coupleId: cs.couple_id,
        partnerName,
        deviceId,
      });
    };

    load();
  }, [user?.id, slug, navigate]);

  if (!coupleData || !backendCardId || !slug) {
    return (
      <div style={{
        minHeight: '100dvh',
        backgroundColor: '#2E2233',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }} />
    );
  }

  return (
    <SessionOneComplete
      slug={slug}
      coupleId={coupleData.coupleId}
      cardId={backendCardId}
      deviceId={coupleData.deviceId}
      partnerName={coupleData.partnerName}
    />
  );
}
