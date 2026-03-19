import { useState, useEffect } from 'react';
import Share from '@/components/still-us/Share';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function SharePage() {
  const { user } = useAuth();
  const [partnerLinkToken, setPartnerLinkToken] = useState<string | null>(null);
  const [hasPartner, setHasPartner] = useState(false);
  const [weekNumber, setWeekNumber] = useState(1);
  const [cardTitle, setCardTitle] = useState<string | undefined>();
  const [realCoupleId, setRealCoupleId] = useState<string | undefined>();

  useEffect(() => {
    if (!user?.id) return;

    // Query couple_state by initiator_id/partner_id (NOT couple_spaces.id)
    (async () => {
      const { data: cs } = await supabase
        .from('couple_state')
        .select('couple_id, partner_link_token, partner_id, partner_tier, current_card_index')
        .or(`initiator_id.eq.${user.id},partner_id.eq.${user.id}`)
        .is('dissolved_at', null)
        .maybeSingle();

      if (cs) {
        setRealCoupleId(cs.couple_id);
        setPartnerLinkToken(cs.partner_link_token ?? null);
        setHasPartner(!!(cs.partner_id || cs.partner_tier === 'tier_2'));
        setWeekNumber((cs.current_card_index ?? 0) + 1);
      }
    })();
  }, [user?.id]);

  // Build the real share link pointing to the partner check-in portal
  const shareLink = partnerLinkToken
    ? `${window.location.origin}/check-in/?token=${partnerLinkToken}`
    : '';

  return (
    <Share
      coupleId={realCoupleId}
      hasPartner={hasPartner}
      weekNumber={weekNumber}
      cardTitle={cardTitle}
      shareLink={shareLink}
    />
  );
}
